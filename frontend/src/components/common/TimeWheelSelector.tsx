import { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Dialog, 
    DialogContent, 
    DialogActions,
    IconButton,
    Paper,
    Stack
} from '@mui/material';
import { AccessTime, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { format, parse, setHours, setMinutes } from 'date-fns';

interface TimeWheelSelectorProps {
    value: string; // "HH:mm" 24h format
    onChange: (newValue: string) => void;
    label: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

export default function TimeWheelSelector({ value, onChange, label }: TimeWheelSelectorProps) {
    const [open, setOpen] = useState(false);
    
    // Parse initial value
    const initialDate = useMemo(() => parse(value, 'HH:mm', new Date()), [value]);
    const initialHour24 = initialDate.getHours();
    const initialHour12 = initialHour24 % 12 === 0 ? 12 : initialHour24 % 12;
    const initialMin = initialDate.getMinutes().toString().padStart(2, '0');
    const initialPeriod = initialHour24 >= 12 ? 'PM' : 'AM';

    const [tempHour, setTempHour] = useState(initialHour12);
    const [tempMin, setTempMin] = useState(initialMin);
    const [tempPeriod, setTempPeriod] = useState(initialPeriod);

    const handleConfirm = () => {
        let h = tempHour % 12;
        if (tempPeriod === 'PM') h += 12;
        
        const newValue = `${h.toString().padStart(2, '0')}:${tempMin}`;
        onChange(newValue);
        setOpen(false);
    };

    const setNow = () => {
        const now = new Date();
        const h24 = now.getHours();
        setTempHour(h24 % 12 === 0 ? 12 : h24 % 12);
        setTempMin(now.getMinutes().toString().padStart(2, '0'));
        setTempPeriod(h24 >= 12 ? 'PM' : 'AM');
    };

    return (
        <>
            <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpen(true)}
                startIcon={<AccessTime />}
                sx={{ 
                    justifyContent: 'flex-start', 
                    py: 1, 
                    px: 1, 
                    borderRadius: 2.5,
                    borderColor: '#e0e0e0',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#0096D6', bgcolor: 'rgba(0,150,214,0.04)' }
                }}
            >
                <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1, mb: 0.2, fontSize: '0.65rem' }}>
                        {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {format(initialDate, 'h:mm a')}
                    </Typography>
                </Box>
            </Button>

            <Dialog 
                open={open} 
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: { 
                        borderRadius: 5, 
                        width: '100%', 
                        maxWidth: 320,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)'
                    }
                }}
            >
                <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Typography variant="h6" fontWeight={800} color="primary">Set {label}</Typography>
                </Box>

                <DialogContent sx={{ py: 2 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 0.5,
                        position: 'relative' 
                    }}>
                        {/* Selected Indicator Highlight */}
                        <Box sx={{ 
                            position: 'absolute', 
                            height: 44, 
                            left: '5%', 
                            right: '25%', 
                            bgcolor: 'rgba(0,150,214,0.08)', 
                            borderRadius: 2,
                            zIndex: 0,
                            pointerEvents: 'none',
                            border: '1px solid rgba(0,150,214,0.2)'
                        }} />

                        {/* Hour Column */}
                        <RollerColumn 
                            items={HOURS} 
                            selected={tempHour} 
                            onSelect={setTempHour} 
                            width={50} 
                        />
                        
                        <Typography variant="h5" fontWeight={300} color="text.secondary">:</Typography>

                        {/* Minute Column */}
                        <RollerColumn 
                            items={MINUTES} 
                            selected={tempMin} 
                            onSelect={setTempMin} 
                            width={50} 
                        />

                        {/* Period Column */}
                        <Box sx={{ ml: 1 }}>
                            {PERIODS.map(p => (
                                <Button 
                                    key={p}
                                    variant={tempPeriod === p ? 'contained' : 'text'}
                                    size="small"
                                    onClick={() => setTempPeriod(p)}
                                    sx={{ 
                                        display: 'block', 
                                        minWidth: 40, 
                                        mb: 0.5,
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        py: 0.5,
                                        boxShadow: tempPeriod === p ? '0 2px 8px rgba(0,150,214,0.3)' : 'none'
                                    }}
                                >
                                    {p}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={setNow}
                            startIcon={<AccessTime sx={{ fontSize: 16 }} />}
                            sx={{ borderRadius: 10, px: 2, fontSize: '0.75rem' }}
                        >
                            Set to Now
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: 'white' }}>
                    <Button onClick={() => setOpen(false)} sx={{ flex: 1, borderRadius: 3 }}>Cancel</Button>
                    <Button 
                        onClick={handleConfirm} 
                        variant="contained" 
                        sx={{ flex: 1, borderRadius: 3, py: 1.5, fontWeight: 700 }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function RollerColumn({ items, selected, onSelect, width }: { items: any[], selected: any, onSelect: (v: any) => void, width: number }) {
    const listRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: any) => {
        const top = e.target.scrollTop;
        const index = Math.round(top / 44);
        if (items[index] !== selected) {
            onSelect(items[index]);
        }
    };

    // Auto-scroll to selected on mount
    useEffect(() => {
        const idx = items.indexOf(selected);
        if (listRef.current && idx !== -1) {
            listRef.current.scrollTop = idx * 44;
        }
    }, [selected]);

    return (
        <Box 
            ref={listRef}
            onScroll={handleScroll}
            sx={{ 
                height: 140, 
                width: width, 
                overflowY: 'auto', 
                scrollSnapType: 'y mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
                position: 'relative',
                zIndex: 1,
                py: '48px' // Padding to allow top/bottom items to reach center
            }}
        >
            {items.map((item, i) => (
                <Box 
                    key={i} 
                    sx={{ 
                        height: 44, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        scrollSnapAlign: 'center',
                        opacity: item == selected ? 1 : 0.3,
                        transform: item == selected ? 'scale(1.1)' : 'scale(0.85)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        onSelect(item);
                        if (listRef.current) listRef.current.scrollTo({ top: i * 44, behavior: 'smooth' });
                    }}
                >
                    <Typography variant="h5" fontWeight={item == selected ? 800 : 400}>
                        {item}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
