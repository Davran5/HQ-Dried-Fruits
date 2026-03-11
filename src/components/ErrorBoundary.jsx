import React from "react";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error intercepted by ErrorBoundary:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-800">
                    <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 flex flex-col max-h-[90vh]">
                        <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2 shrink-0">
                            <AlertTriangle size={28} />
                            React Rendering Error Intercepted
                        </h1>
                        <p className="text-slate-600 mb-6 shrink-0">
                            A critical error occurred while attempting to render the component tree. The application was halted to prevent further corruption.
                        </p>

                        <div className="flex-1 overflow-y-auto space-y-6">
                            <div className="bg-red-50 text-red-900 p-4 rounded-lg font-mono text-sm border border-red-100/50">
                                <span className="block font-bold mb-2 text-red-800 uppercase tracking-wide text-xs">Error Message</span>
                                {this.state.error?.message}
                            </div>

                            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs border border-slate-800">
                                <span className="block font-bold mb-2 text-slate-400 uppercase tracking-wide">Component Stack Trace</span>
                                <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed py-2">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 shrink-0">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Reload Component Tree
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
