import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

jest.mock('@iconify/react', () => ({ Icon: () => null }));
// CRA's Jest resolver predates package subpath exports; keep the real router.
jest.mock('react-router-dom', () => jest.requireActual('react-router'));
jest.mock('./components/MapView', () => () => <div aria-label="แผนที่การทำงาน" />);

beforeEach(() => {
  window.location.hash = '#/history';
  window.scrollTo = jest.fn();
  window.matchMedia = jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('desktop collapses to the icon rail when selecting a new or current route', async () => {
  window.matchMedia.mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  render(<App />);
  const navigation = screen.getByRole('navigation', { name: 'เมนูหลัก' });
  const toggle = screen.getByRole('button', { name: 'เปิด/ปิดเมนู' });
  expect(navigation).not.toHaveAttribute('inert');
  expect(navigation).not.toHaveClass('open');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(within(navigation).getByRole('link', { name: 'ประวัติการทำงาน' })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(toggle);
  expect(navigation).toHaveClass('open');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.queryByRole('button', { name: 'ปิดเมนูด้านหลัง' })).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
  fireEvent.click(within(navigation).getByRole('link', { name: 'ภารกิจ / แผนที่' }));
  expect(await screen.findByRole('heading', { name: 'ภารกิจ / แผนที่', level: 1 })).toBeInTheDocument();
  expect(navigation).not.toHaveClass('open');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(within(navigation).getByRole('link', { name: 'ภารกิจ / แผนที่' })).toHaveAttribute('aria-current', 'page');
  expect(within(navigation).getByRole('link', { name: 'หน้าหลัก' })).not.toHaveAttribute('aria-current');
  fireEvent.click(toggle);
  fireEvent.click(within(navigation).getByRole('link', { name: 'ภารกิจ / แผนที่' }));
  expect(navigation).not.toHaveClass('open');
});

test('switching between desktop and drawer resets open state and releases scroll locking', () => {
  let onBreakpointChange;
  window.matchMedia.mockReturnValue({
    matches: true,
    addEventListener: jest.fn((event, listener) => { onBreakpointChange = listener; }),
    removeEventListener: jest.fn(),
  });
  render(<App />);
  const navigation = screen.getByRole('navigation', { name: 'เมนูหลัก' });
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  act(() => onBreakpointChange({ matches: false }));
  expect(navigation).toHaveAttribute('inert');
  expect(navigation).not.toHaveClass('open');
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  expect(document.body.style.overflow).toBe('hidden');
  act(() => onBreakpointChange({ matches: true }));
  expect(navigation).not.toHaveAttribute('inert');
  expect(navigation).not.toHaveClass('open');
  expect(document.body.style.overflow).not.toBe('hidden');
});

test('collapsed links expose tooltips on hover and focus, then dismiss them on leave', () => {
  window.matchMedia.mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  render(<App />);
  const link = screen.getByRole('link', { name: 'ภารกิจ / แผนที่' });
  fireEvent.mouseEnter(link);
  expect(screen.getByRole('tooltip')).toHaveTextContent('ภารกิจ / แผนที่');
  expect(link).toHaveAttribute('aria-describedby', 'navigation-tooltip');
  fireEvent.mouseLeave(link);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.focus(link);
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  fireEvent.keyDown(link, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'เปิด/ปิดเมนู' }));
  fireEvent.mouseEnter(link);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
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
