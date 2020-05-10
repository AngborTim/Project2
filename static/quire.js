document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.chanel_name').forEach(function(chanel_block) {
      chanel_block.onmouseover = function() {
        chanel_block.classList.remove('bg-light');
        chanel_block.classList.add('bg-dark');
      }
      chanel_block.onmouseout = function() {
        chanel_block.classList.remove('bg-dark');
        chanel_block.classList.add('bg-light');
      }
    })
});


