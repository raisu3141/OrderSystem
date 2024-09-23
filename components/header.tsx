import Link from 'next/link'
import styles from '../styles/Home.module.css'

export function Header() {
    return (
        <nav className={styles.nav}>
            <ul>
                <li>
                    <Link href="/" className="nav-link">
                    NANCA
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default Header;