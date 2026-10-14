import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            পেজটি লোড করতে একটি সমস্যা হয়েছে
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md font-mono bg-muted/40 p-3 rounded-lg border border-border/70 text-left overflow-auto">
            {this.state.error?.message || "Unknown error occurred"}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              <span>পুনরায় চেষ্টা করুন (Reload)</span>
            </Button>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              <span>হোমপেজে যান</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
