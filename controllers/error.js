
/**
 * Controller function to handle 404 (Page Not Found) errors. It renders
 * a custom error page with a 404 status code, showing an appropriate message
 * for the user when a route is not found.
 *
 * @param req - Express request object, typically contains request details such as URL
 * @param res - Express response object used for sending the error page response
 * @param next - Express next function, passed for consistency (not used here)
 */
exports.get404 = (req, res, next) => {
    res.status(404).render('error', {
        pageTitle: 'Page Not Found',
        path : '',
        errorMsg: 'Page Not Found'
    });
};