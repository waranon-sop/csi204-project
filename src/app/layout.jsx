import '../styles/index.css';
import Providers from '../components/Providers';
import PageLayout from '../components/PageLayout';

export const metadata = {
  title: 'Re-wear',
  description: 'Re-wear fashion e-commerce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PageLayout>
            {children}
          </PageLayout>
        </Providers>
      </body>
    </html>
  );
}
