import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface MarketingConsentEmailProps {
    recoverLink: string;
    withdrawLink: string;
}

export const MarketingConsentEmail = ({
    recoverLink,
    withdrawLink,
}: MarketingConsentEmailProps) => (
    <Html>
        <Head />
        <Preview>Dziękujemy za zapis — podbij swoje ogłoszenie za 1 zł</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Twoje podbicie za 1 zł czeka</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Dziękujemy za zapis na wiadomości od Lekcjo.pl! W podziękowaniu możesz jednorazowo
                    podbić swoje ogłoszenie na górę listy za <strong>1 zł</strong>.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
                    <Text style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Jak skorzystać z promocji:</Text>
                    <Text style={{ margin: '0 0 6px' }}>1. Otwórz stronę zarządzania ogłoszeniem (link z maila potwierdzającego dodanie ogłoszenia).</Text>
                    <Text style={{ margin: '0 0 15px' }}>2. W sekcji „Promocja” wybierz podbicie — zapłacisz 1 zł.</Text>
                    <Button
                        href={recoverLink}
                        style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        Nie mam linku do zarządzania
                    </Button>
                </Section>

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '12px', color: '#888' }}>
                    Otrzymujesz tę wiadomość, bo dla tego adresu wyrażono zgodę na informacje marketingowe od Lekcjo.pl.
                    Nie chcesz ich dostawać? <a href={withdrawLink} style={{ color: '#556cd6' }}>Wycofaj zgodę</a>.
                </Text>
            </Container>
        </Body>
    </Html>
);


export default MarketingConsentEmail;
