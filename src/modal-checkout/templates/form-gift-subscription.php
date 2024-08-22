<?php
/**
 * Checkout gift subscription form.
 *
 * @see https://woo.com/document/template-structure/
 * @package Newspack_Blocks
 */

defined( 'ABSPATH' ) || exit;

?>
<div class="woocommerce-additional-fields newspack-wcsg--wrapper">
	<div class="woocommerce-additional-fields__field-wrapper">
		<?php if ( ! $is_renewal ) : ?>
		<p class="newspack-wcsg--gift-toggle form-row form-row-wide">
			<label for="newspack_wcsg_is_gift">
				<input type="checkbox" id="newspack_wcsg_is_gift" name="newspack_wcsg_is_gift" <?php echo esc_attr( $is_limited ? 'checked disabled' : '' ); ?>/>
				<?php echo \esc_html( \Newspack_Blocks\Modal_Checkout::subscriptions_gifting_label() ); ?>
				<?php if ( $is_limited ) : ?>
					<span class="newspack-ui__helper-text"><?php echo esc_html( __( 'This item is only purchasable as a gift.', 'newspack-blocks' ) ); ?></span>
				<?php endif; ?>
			</label>
		</p>
		<p id="wcsg_gift_recipients_email_field" class="newspack-wcsg--gift-email form-row form-row-wide  <?php echo esc_attr( $is_limited ? 'validate-required validate-email' : '' ); ?>">
			<label for="wcsg_gift_recipients_email">
				<?php esc_html_e( 'Recipient’s Email Address', 'newspack-blocks' ); ?>
				<?php if ( $is_limited ) : ?>
					<abbr class="required" title="required">*</abbr>
				<?php endif; ?>
			</label>
			<input type="email" class="input-text" name="wcsg_gift_recipients_email" placeholder="<?php echo esc_attr( __( 'recipient@example.com', 'newspack-blocks' ) ); ?>" value="<?php echo esc_attr( $email ); ?>"/>
		</p>
		<?php else : ?>
			<label class="woocommerce_subscriptions_gifting_recipient_email">
				<?php esc_html_e( 'Recipient: ', 'newspack-blocks' ); ?>
			</label>
			<?php echo esc_html( $email ); ?>
		<?php endif; ?>
	</div>
</div>
