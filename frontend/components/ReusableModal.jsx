import React from "react";
import ReactDOM from "react-dom";

const ReusableModal = ({
  show,
  onClose,
  title,
  body,
  footerButtons = [],
}) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content position-relative">
            {/* Close button */}
            <button
              type="button"
              className="btn-close position-absolute"
              aria-label="Close"
              style={{ top: "1rem", right: "1rem" }}
              onClick={onClose}
            ></button>

            <div className="modal-header border-0 pt-4 pb-2">
              <h5 className="modal-title">{title}</h5>
            </div>

            <hr className="my-0" />

            <div className="modal-body py-4">{body}</div>

            <div className="modal-footer border-0 pb-4 d-flex justify-content-end gap-2">
              {footerButtons.map((btn, index) => (
                <button
                  key={index}
                  className={`btn btn-${btn.variant || "secondary"}`}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ReusableModal;
