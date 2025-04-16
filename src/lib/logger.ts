type LogLevel = "info" | "warn" | "error" | "debug"

interface LogOptions {
  context?: string
  data?: any
}

class Logger {
  private static instance: Logger
  private isEnabled = true
  private logToConsole = true
  private logToServer = false
  private serverEndpoint = "/api/logs"

  private constructor() {
    // Initialize with environment-specific settings
    if (typeof window !== "undefined") {
      this.isEnabled = process.env.NODE_ENV !== "production" || localStorage.getItem("debug-mode") === "true"
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (typeof window !== "undefined") {
      if (enabled) {
        localStorage.setItem("debug-mode", "true")
      } else {
        localStorage.removeItem("debug-mode")
      }
    }
  }

  public enableServerLogging(endpoint?: string): void {
    this.logToServer = true
    if (endpoint) {
      this.serverEndpoint = endpoint
    }
  }

  public disableServerLogging(): void {
    this.logToServer = false
  }

  public info(message: string, options?: LogOptions): void {
    this.log("info", message, options)
  }

  public warn(message: string, options?: LogOptions): void {
    this.log("warn", message, options)
  }

  public error(message: string, error?: Error, options?: LogOptions): void {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : undefined

    this.log("error", message, {
      ...options,
      data: {
        ...(options?.data || {}),
        error: errorData,
      },
    })
  }

  public debug(message: string, options?: LogOptions): void {
    this.log("debug", message, options)
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.isEnabled && level !== "error") return

    const timestamp = new Date().toISOString()
    const context = options?.context || "app"
    const logData = {
      timestamp,
      level,
      message,
      context,
      data: options?.data,
    }

    if (this.logToConsole) {
      this.logToConsoleMethod(level, logData)
    }

    if (this.logToServer) {
      this.sendToServer(logData)
    }
  }

  private logToConsoleMethod(level: LogLevel, logData: any): void {
    const formattedMessage = `[${logData.timestamp}] [${logData.level.toUpperCase()}] [${logData.context}]: ${logData.message}`
    const data = logData.data ? logData.data : ""

    switch (level) {
      case "info":
        console.info(formattedMessage, data)
        break
      case "warn":
        console.warn(formattedMessage, data)
        break
      case "error":
        console.error(formattedMessage, data)
        break
      case "debug":
        console.debug(formattedMessage, data)
        break
    }
  }

  private async sendToServer(logData: any): Promise<void> {
    try {
      await fetch(this.serverEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      })
    } catch (error) {
      // Fallback to console if server logging fails
      console.error("Failed to send log to server:", error)
    }
  }
}

export const logger = Logger.getInstance()