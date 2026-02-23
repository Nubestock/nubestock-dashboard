import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

describe('ImageWithFallback', () => {
  describe('Initial rendering', () => {
    it('should render the image with provided src', () => {
      render(<ImageWithFallback src="test-image.jpg" alt="Test image" />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'test-image.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should apply className to the image', () => {
      render(<ImageWithFallback src="test.jpg" alt="Test" className="custom-class" />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-class');
    });

    it('should apply style to the image', () => {
      render(<ImageWithFallback src="test.jpg" alt="Test" style={{ width: '100px' }} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ width: '100px' });
    });

    it('should pass additional props to the image', () => {
      render(<ImageWithFallback src="test.jpg" alt="Test" data-testid="custom-img" />);
      
      const img = screen.getByTestId('custom-img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show fallback when image fails to load', () => {
      render(<ImageWithFallback src="invalid.jpg" alt="Test" />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      const fallbackImg = screen.getByAltText('Error loading image');
      expect(fallbackImg).toBeInTheDocument();
    });

    it('should preserve original src in data attribute when error occurs', () => {
      render(<ImageWithFallback src="original-url.jpg" alt="Test" />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      const fallbackImg = screen.getByAltText('Error loading image');
      expect(fallbackImg).toHaveAttribute('data-original-url', 'original-url.jpg');
    });

    it('should apply className to fallback container', () => {
      render(<ImageWithFallback src="invalid.jpg" alt="Test" className="my-class" />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      const container = screen.getByAltText('Error loading image').closest('div');
      expect(container?.parentElement).toHaveClass('my-class');
    });

    it('should apply style to fallback container', () => {
      render(<ImageWithFallback src="invalid.jpg" alt="Test" style={{ height: '200px' }} />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      const container = screen.getByAltText('Error loading image').closest('.inline-block');
      expect(container).toHaveStyle({ height: '200px' });
    });
  });

  describe('Without className', () => {
    it('should handle undefined className gracefully', () => {
      render(<ImageWithFallback src="invalid.jpg" alt="Test" />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      const container = screen.getByAltText('Error loading image').closest('.inline-block');
      expect(container).toBeInTheDocument();
    });
  });
});
