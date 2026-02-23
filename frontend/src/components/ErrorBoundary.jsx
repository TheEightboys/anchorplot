import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Safely log error
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        const errorStack = error?.stack || 'No stack trace';
        
        console.error('Error caught by boundary:', errorMessage);
        console.error('Error stack:', errorStack);
        
        this.setState({
            error: { message: errorMessage, stack: errorStack },
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md w-full">
                        <div className="bg-surface border border-border-light rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-danger" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-text-primary mb-2">
                                Something went wrong
                            </h1>
                            
                            <p className="text-text-secondary mb-6">
                                We're sorry, but something unexpected happened. Please try refreshing the page or returning to the home page.
                            </p>

                            {import.meta.env.DEV && this.state.error && (
                                <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-xs font-mono text-danger break-all">
                                        {this.state.error.message || 'Unknown error'}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={this.handleReload}
                                    className="btn btn-primary flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Reload Page
                                </button>
                                <button
                                    onClick={this.handleReset}
                                    className="btn btn-secondary flex items-center justify-center gap-2"
                                >
                                    <Home size={16} />
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
