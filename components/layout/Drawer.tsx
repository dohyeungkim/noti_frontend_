'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Drawer() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const openDrawer = () => {
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    return (
        <>
            {/* Drawer */}
            <div className={`drawer ${isOpen ? 'open' : 'closed'}`} onClick={!isOpen ? openDrawer : undefined}>
                {/* Profile Section */}
                <div className="profile-section">
                    <button className="toggle-button" onClick={toggleDrawer}>
                        {isOpen ? '✖' : '☰'}
                    </button>
                    {isOpen && <p>Hello, 서연 한!</p>}
                </div>

                {/* Navigation Links */}
                <div className="content">
                    <ul>
                        <li>
                            <Link href="/">
                                <span>🏠</span> {isOpen && '나의 페이지'}
                            </Link>
                        </li>
                        <li>
                            <Link href="/solved">
                                <span>📚</span> {isOpen && '내가 푼 문제 모음'}
                            </Link>
                        </li>
                        <li>
                            <Link href="/groups">
                                <span>👥</span> {isOpen && '나의 그룹'}
                            </Link>
                        </li>
                        <li>
                            <Link href="/my-questions">
                                <span>✏️</span> {isOpen && '문제 등록하기'}
                            </Link>
                        </li>
                        <li>
                            <Link href="/notifications">
                                <span>📩</span> {isOpen && '알림함'}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .drawer {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: ${isOpen ? '250px' : '60px'};
                    background: #f8f9fa;
                    transition: width 0.3s ease-in-out;
                    z-index: 1000;
                    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                    cursor: ${isOpen ? 'default' : 'pointer'};
                }

                .drawer.closed {
                    cursor: pointer;
                }

                .profile-section {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: #0070f3;
                    color: white;
                }

                .profile-section p {
                    margin-left: 1rem;
                }

                .toggle-button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }

                .content {
                    padding: 1rem;
                }

                ul {
                    list-style: none;
                    padding: 0;
                }

                ul li {
                    margin: 1rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                ul li a {
                    text-decoration: none;
                    color: #0070f3;
                    display: flex;
                    align-items: center;
                }

                ul li span {
                    font-size: 1.2rem;
                }
            `}</style>
        </>
    );
}
