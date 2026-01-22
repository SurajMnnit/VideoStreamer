import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} border-slate-700 border-t-indigo-500 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
};

export const PageSpinner = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
            <Spinner size="xl" className="mb-4" />
            <p className="text-slate-400 text-sm">Loading...</p>
        </div>
    </div>
);

export default Spinner;
