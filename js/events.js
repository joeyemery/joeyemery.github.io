var monsterClick = false;

$(document).ready(function() {

	$.ajaxSetup({cache:false})

	// Interval for sprite animation
	var spriteInt = setInterval("animateSprite()", spriteOptions.scrollSpeed);

	// Monster animations
	masterAnimateMonster();

	// Testimonials fader
	var testimonialsInt = setInterval("altFadeTestimonials()", 5000);

	// Code to make the accordion work
	$('#accordion .ac_title a, .openaccordion').click(function(e) {
		if($(this).hasClass('force_open')) {
			var force_open = true;
		} else {
			var force_open = false;
		}
		e.preventDefault();
		openAccordion($(this).attr('href'), force_open);
	});

	// Get recent tracks (From Last.FM for 'about me'), also update them every 5 seconds?
	getRecentTracks();
	var tracksInt = setInterval("updateRecentTracks()", 5000);

	// Input watermarks
	inputWatermarks();

	// Do skill ratings
	skillRatings();

	// Portfolio stuff
	portfolioHover();
	portfolioSlider();

	$('.fancybox').fancybox();

	// Contact form
	$('#contact_form').submit(function(e) {
		e.preventDefault();
		var data = new Object();

		// Grab the content.
		data.name = $('#contact_form #input_name').val();
		data.email = $('#contact_form #input_email').val();
		data.message = $('#contact_form #input_message').val();

		$.ajax({
			type: 'GET',
			url: 'http://j03y.pagodabox.com/send_message.php',
			data: data,
			success: function(response) {
				if(response.success == 'true') {
					$('#contact_form').fadeOut(500, function() {
						$('#form_response h2').text('Thank you!');
						$('#form_response p').text('Your message has been successfully sent, I\'ll be in touch soon!');
						$('#form_response').fadeIn(500);
					});
				} else {
					$('#contact_form').fadeOut(500, function() {
						$('#form_response h2').text('Uh oh!');
						$('#form_response p').text('Something went wrong and your message wasn\'t sent, please refresh the page and try again!');
						$('#form_response').fadeIn(500);
					});
				}
			},
			dataType: 'json'
		});
	});

	// Name, from, content.
});


// Post header (sprite) animation.
var spriteOptions = new Object();
spriteOptions.scrollSpeed = 60; spriteOptions.step = 1; spriteOptions.current = -1440; spriteOptions.restart = 0;

function animateSprite() {
	spriteOptions.current += spriteOptions.step;
	if(spriteOptions.current == spriteOptions.restart) {
		spriteOptions.current = -1440;
	}
	$('#post_header').css('left', spriteOptions.current + 'px');
}

// Monster animations
function masterAnimateMonster() {
	animateMonsterY();
	animateMonsterX();
}
function animateMonsterY() {
	$('#monster').animate({'top':'20px'}, {duration: 1000, queue: false, complete: function() {
		$('#monster').animate({'top':'0px'}, {duration: 1000, queue: false, complete: function() {
			animateMonsterY();
		}});
	}});
}

function animateMonsterX() {
	$('#monster').animate({'right':'50px'}, {duration: 3000, queue: false, complete: function() {
		$('#monster').animate({'right':'0px'}, {duration: 3000, queue: false, complete: function() {
			animateMonsterX();
		}});
	}});
}

// Testimonials fader
function altFadeTestimonials() {
	$('#testimonials li.active').fadeOut(1000);
	if($('#testimonials li.active').next('li').length > 0) {
		$('#testimonials li.active').next('li').fadeIn(1000, function() {
			$('#testimonials li.active').next('li').addClass('active');
			$('#testimonials li.active:first').removeClass('active');
		});
	} else {
		$('#testimonials li:first').fadeIn(1000, function() {
			$('#testimonials li').removeClass('active');
			$('#testimonials li:first').addClass('active');
		});
	}
}

// Accordion
function openAccordion(container_id, force_open) {
	if('#' + $('#accordion .container.active').attr('id') != container_id) {
		$('#accordion .container.active .ac_content').slideUp(function() {
			$(this).parent().removeClass('active');
		});
		$('#accordion ' + container_id + ' .ac_content').slideDown(function() {
			scrollTo(container_id);
		});
		$('#accordion ' + container_id).addClass('active');
	} else {
		if(force_open == false) {
			$('#accordion .container.active .ac_content').slideUp(function() {
				$(this).parent().removeClass('active');
			});
		} else {
			scrollTo(container_id);
		}
	}
}

// Scroll to animation
function scrollTo(container_id) {
	var pos = $(container_id).offset().top - 13;
	$('html, body').animate({scrollTop: pos}, 500);
}

// Last.FM recent tracks
var recentTracksOptions = new Object();
var mostRecentTrackName = false;
recentTracksOptions.api_key = '454c6577fad4d54915150ccbd93c18ea'; recentTracksOptions.user = 'joeyjustsmile'; recentTracksOptions.limit = 5;
function getRecentTracks() {
	$.ajax({
		type: 'GET',
		url: 'http://ws.audioscrobbler.com/2.0/?&method=user.getrecenttracks&user=' + recentTracksOptions.user + '&api_key=' + recentTracksOptions.api_key + '&format=json&limit=' + recentTracksOptions.limit,
		success: function(tracks) {
			var count = 0;
			console.log(tracks);
			$(tracks.recenttracks.track).each(function(key, value) {
				if(count < 5) {
					if(value.date) {
						var date = new Date(value.date['#text'] + '+1');
						$('#recent_tracks').append('<li class="track" data-track-name="' + value.name + '"><a href="' + value.url + '" target="_blank">' + value.name + ' - ' + value.artist['#text'] + '</a><span title="' + ISODateString(date) + '">' + date + '</span></li>');
						$('#recent_tracks li span').timeago();
					} else {
						$('#recent_tracks').append('<li class="track" data-track-name="' + value.name + '"><a href="' + value.url + '" target="_blank">' + value.name + ' - ' + value.artist['#text'] + '</a><span class="listening_now">Playing right now</span></li>');
						$('#recent_tracks li span').timeago();
					}
				}
				count++;
			});
			mostRecentTrackName =	$('#recent_tracks li.track:first').attr('data-track-name');
		},
		error: function(xhr, type, exception) { console.log(exception); }
	});
}

// Last.FM update recent tracks
function updateRecentTracks() {
	$.get('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + recentTracksOptions.user + '&api_key=' + recentTracksOptions.api_key + '&format=json&limit=1', function(tracks) {
		if(tracks.recenttracks) {
			if(tracks.recenttracks.track[1]) {
				var newTrack = tracks.recenttracks.track[0];
			} else {
				var newTrack = tracks.recenttracks.track;
			}
		}
		if(newTrack.name != mostRecentTrackName) {
			$('#recent_tracks li.desc').after('<li style="display: none;" class="track" data-track-name="' + newTrack.name + '"><a href="' + newTrack.url + '" target="_blank">' + newTrack.name + ' - ' + newTrack.artist['#text'] + '</a><span class="listening_now">Playing right now</span></li>');
			$('#recent_tracks li:last').fadeOut({duration: 500, queue: false, complete: function() {
				$(this).remove();
			}});
			$('#recent_tracks li.track:first').fadeIn({duration: 500, queue: false, complete: function() {
				if($(this).next('li').children('span').hasClass('listening_now')) {
					$(this).next('li').children('span').text('Just played').removeClass('listening_now');
				}
				$('#recent_tracks li:last').css('border', 'none');
			}});
			mostRecentTrackName = newTrack.name;
		}
	});
}

// Convert dates to ISO
function ISODateString(d) {
	function pad(n){
		return n < 10 ? '0' + n : n
	}
	return d.getUTCFullYear()+'-'
  + pad(d.getUTCMonth()+1)+'-'
  + pad(d.getUTCDate())+'T'
  + pad(d.getUTCHours())+':'
  + pad(d.getUTCMinutes())+':'
  + pad(d.getUTCSeconds())+'Z'
}

// Input watermarks (using labels)
function inputWatermarks() {
	$('input, textarea').bind('keydown, keyup', function() {
		if($(this).val() != '') {
			$(this).prev('label').hide(0);
		} else {
			$(this).prev('label').show(0);
		}
	});
}

// Skill ratings
function skillRatings() {
	$('.skill_rating').each(function() {
		for(i = 0; i < 10; i++) {
			$(this).append('<li></li>');
		}

		var skillRating = $(this).attr('data-skill');
		$(this).children('li').slice(0, skillRating).addClass('skill_star');
	});
}

// Portfolio hover
function portfolioHover() {
	$('#recent_work .work_item').hover(function() {
		$(this).children('a').stop(true, true).fadeIn(400);
	}, function() {
		$(this).children('a').stop(true, true).fadeOut(400);
	});
}

// Portfolio slider
var portfolioSliderInMotion = false;
function portfolioSlider() {
	$('#recent_work li.active .work_item').css('display', 'inline-block');

	$('#work_pagination a').click(function(e) {
		e.preventDefault();
		if(!$(this).parent('li').hasClass('active') && portfolioSliderInMotion == false) {
			portfolioSliderInMotion = true;
			var thisIndex = $(this).parent('li').index() + 1;
			$('#recent_work li.active .work_item').hide();
			$('#recent_work li.active').removeClass('active');
			$('#recent_work li:nth-child(' + thisIndex + ')').addClass('active');
			portfolioStaggeredFade();

			$('#work_pagination .active').removeClass('active');
			$(this).parent('li').addClass('active');
		}
	});
}

function portfolioStaggeredFade() {
	var max = $('#recent_work li.active .work_item').length - 1;
	$('#recent_work li.active .work_item').each(function(i) {
		if(i == max) {
			$(this).delay((i + 1) * 150).fadeIn(800, function() {
				portfolioSliderInMotion = false;
			});
		} else {
			$(this).delay((i + 1) * 150).fadeIn(800);
		}
	});
}
