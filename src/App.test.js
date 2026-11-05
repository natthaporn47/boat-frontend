import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

jest.mock('@iconify/react', () => ({ Icon: () => null }));
// CRA's Jest resolver predates package subpath exports; keep the real router.
jest.mock('react-router-dom', () => jest.requireActual('react-router'));
jest.mock('./components/MapView', () => () => <div aria-label="แผนที่การทำงาน" />);

beforeEach(() => {
  window.location.hash = '#/history';
  window.scrollTo = jest.fn();
  window.matchMedia = jest.fn(() => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('has one drawer, closes it on navigation, and preserves the mission popup', async () => {
  render(<App />);
  expect(document.querySelectorAll('.navbar')).toHaveLength(1);
  const navigation = document.querySelector('.navbar');
  expect(navigation).toHaveAttribute('inert');
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  expect(navigation).toHaveClass('open');
  expect(navigation).not.toHaveAttribute('inert');
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(within(navigation).getByRole('link', { name: 'ภารกิจ / แผนที่' }));
  expect(await screen.findByRole('heading', { name: 'ภารกิจ / แผนที่', level: 1 })).toBeInTheDocument();
  expect(navigation).not.toHaveClass('open');
  expect(document.body.style.overflow).not.toBe('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจ' }));
  expect(screen.getByRole('dialog', { name: 'ข้อมูลการพ่นยา' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('จำนวนชนิดน้ำยา'), { target: { value: '3' } });
  expect(screen.getAllByLabelText('ชื่อยา')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'ปิดหน้าต่าง' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  fireEvent.click(screen.getByRole('button', { name: 'ปิดเมนูด้านหลัง' }));
  expect(navigation).not.toHaveClass('open');
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(navigation).not.toHaveClass('open');
});
