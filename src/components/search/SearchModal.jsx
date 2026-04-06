import { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { Search, FileText, User, Clock, ArrowRight, BookOpen, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../services/api';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ students: [], exams: [] });
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage safely
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed);
                } else {
                    setRecentSearches([]);
                }
            } catch (e) {
                setRecentSearches([]);
            }
        }
    }, []);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Search on query change
    useEffect(() => {
        if (query.length < 2) {
            setResults({ students: [], exams: [] });
            return;
        }

        const searchTimeout = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await searchApi.search({ q: query, limit: 5 });
                setResults(response.data.data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [query]);

    const handleSelect = (item, type) => {
        // Save to recent searches safely
        const search = { query, type, item, timestamp: Date.now() };
        const safeRecents = Array.isArray(recentSearches) ? recentSearches : [];
        const updated = [search, ...safeRecents.filter(s => s.query !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        // Navigate based on type
        if (type === 'student') {
            navigate(`/students/${item._id}`);
        } else if (type === 'exam') {
            navigate(`/results?subject=${item.subjectCode}`);
        }

        onClose();
        setQuery('');
    };

    // Ensure results has safe fallbacks to prevent render crashes if API responds weirdly
    const safeStudents = Array.isArray(results?.students) ? results.students : [];
    const safeExams = Array.isArray(results?.exams) ? results.exams : [];
    const totalResults = safeStudents.length + safeExams.length;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                style={{ position: 'relative', zIndex: 100 }}
                onClose={onClose}
                initialFocus={inputRef}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 backdrop-blur-none"
                    enterTo="opacity-100 backdrop-blur-sm"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 backdrop-blur-sm"
                    leaveTo="opacity-0 backdrop-blur-none"
                >
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(8px)'
                        }}
                    />
                </Transition.Child>

                <div style={{ position: 'fixed', inset: 0, overflow: 'y-auto', padding: '100px 16px' }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel
                            style={{
                                width: '100%',
                                maxWidth: '680px',
                                margin: '0 auto',
                                backgroundColor: 'var(--color-card-bg, #ffffff)',
                                borderRadius: '24px',
                                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3)',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Combobox onChange={(value) => value && handleSelect(value.item, value.type)}>
                                {/* Search Input */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '24px 32px',
                                        borderBottom: '1px solid var(--color-border)',
                                        background: 'transparent'
                                    }}
                                >
                                    <Search size={24} color="var(--color-primary)" style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))' }} />
                                    <Combobox.Input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search students, exams, subjects..."
                                        style={{
                                            flex: 1,
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '18px',
                                            marginLeft: '20px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--color-text-primary)',
                                            fontWeight: 500,
                                            height: '32px'
                                        }}
                                    />
                                    {isLoading ? (
                                        <div
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                border: '3px solid var(--color-border)',
                                                borderTopColor: 'var(--color-primary)',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }}
                                        />
                                    ) : (
                                        <kbd style={{
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--color-surface)',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            boxShadow: 'inset 0 -2px 0 #e2e8f0'
                                        }}>
                                            ESC
                                        </kbd>
                                    )}
                                </div>

                                {/* Results */}
                                <Combobox.Options
                                    static
                                    style={{
                                        maxHeight: '480px',
                                        overflow: 'auto',
                                        padding: '16px 0'
                                    }}
                                >
                                    {query.length < 2 && recentSearches.length > 0 && (
                                        <div style={{ padding: '0 16px' }}>
                                            <h4 style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: 'var(--color-primary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px',
                                                marginLeft: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Clock size={12} /> Recent Searches
                                            </h4>
                                            {recentSearches.map((search, index) => (
                                                <Combobox.Option
                                                    key={index}
                                                    value={{ item: search.item, type: search.type }}
                                                    style={({ active }) => ({
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                        padding: '16px 24px',
                                                        margin: '0 8px',
                                                        borderRadius: '16px',
                                                        cursor: 'pointer',
                                                        backgroundColor: active ? 'var(--color-surface)' : 'transparent',
                                                        transition: 'all 0.15s ease'
                                                    })}
                                                >
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        backgroundColor: 'var(--color-surface)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Clock size={18} color="var(--color-text-secondary)" />
                                                    </div>
                                                    <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                                                        {search.query}
                                                    </span>
                                                </Combobox.Option>
                                            ))}
                                        </div>
                                    )}

                                    {query.length >= 2 && totalResults === 0 && !isLoading && (
                                        <div style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '24px',
                                                backgroundColor: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 24px'
                                            }}>
                                                <Search size={32} color="var(--color-text-muted)" />
                                            </div>
                                            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px' }}>
                                                No results found for "{query}"
                                            </p>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                                                Try searching for a different keyword or check spelling.
                                            </p>
                                        </div>
                                    )}

                                    {safeStudents.length > 0 && (
                                        <div style={{ padding: '12px 16px' }}>
                                            <h4 style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: 'var(--color-primary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px',
                                                marginLeft: '16px'
                                            }}>
                                                Students
                                            </h4>
                                            {safeStudents.map((student) => (
                                                <Combobox.Option
                                                    key={student._id}
                                                    value={{ item: student, type: 'student' }}
                                                    style={({ active }) => ({
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                        padding: '16px 24px',
                                                        margin: '0 8px',
                                                        borderRadius: '16px',
                                                        cursor: 'pointer',
                                                        backgroundColor: active ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                                        transition: 'all 0.15s ease'
                                                    })}
                                                >
                                                    {({ active }) => (
                                                        <>
                                                            <div
                                                                style={{
                                                                    width: '48px',
                                                                    height: '48px',
                                                                    borderRadius: '14px',
                                                                    backgroundColor: active ? 'var(--color-card-bg)' : 'rgba(99, 102, 241, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <User size={22} color="var(--color-primary)" />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                                    {student.profile?.firstName} {student.profile?.lastName}
                                                                </p>
                                                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span style={{ fontWeight: 500 }}>{student.studentId}</span> • {student.profile?.department}
                                                                </p>
                                                            </div>
                                                            {active && <ArrowRight size={20} color="var(--color-primary)" style={{ animation: 'slideRight 0.3s ease' }} />}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </div>
                                    )}

                                    {safeExams.length > 0 && (
                                        <div style={{ padding: '12px 16px' }}>
                                            <h4 style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: 'var(--color-success)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px',
                                                marginLeft: '16px'
                                            }}>
                                                Exams & Results
                                            </h4>
                                            {safeExams.map((exam) => (
                                                <Combobox.Option
                                                    key={exam._id}
                                                    value={{ item: exam, type: 'exam' }}
                                                    style={({ active }) => ({
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                        padding: '16px 24px',
                                                        margin: '0 8px',
                                                        borderRadius: '16px',
                                                        cursor: 'pointer',
                                                        backgroundColor: active ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                                                        transition: 'all 0.15s ease'
                                                    })}
                                                >
                                                    {({ active }) => (
                                                        <>
                                                            <div
                                                                style={{
                                                                    width: '48px',
                                                                    height: '48px',
                                                                    borderRadius: '14px',
                                                                    backgroundColor: active ? 'var(--color-card-bg)' : 'rgba(16, 185, 129, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: active ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <BookOpen size={22} color="var(--color-success)" />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                                    {exam.subjectName}
                                                                </p>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Hash size={12} /> {exam.subjectCode}
                                                                    </p>
                                                                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>•</span>
                                                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                                        Sem {exam.semester}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`badge badge-${exam.grade === 'F' ? 'error' : 'success'}`} style={{ fontWeight: 700, fontSize: '13px' }}>
                                                                {exam.grade}
                                                            </span>
                                                            {active && <ArrowRight size={20} color="var(--color-success)" style={{ animation: 'slideRight 0.3s ease' }} />}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </div>
                                    )}
                                </Combobox.Options>

                                {/* Footer */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px 32px',
                                        borderTop: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface)',
                                        fontSize: '12px',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 500
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><kbd style={{ background: 'var(--color-card-bg)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>↑↓</kbd> to navigate</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><kbd style={{ background: 'var(--color-card-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>↵</kbd> to select</span>
                                    </div>
                                    {totalResults > 0 && (
                                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{totalResults} results found</span>
                                    )}
                                </div>
                            </Combobox>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
                <style jsx>{`
                    @keyframes slideRight {
                        from { transform: translateX(-5px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </Dialog>
        </Transition>
    );
};

export default SearchModal;
