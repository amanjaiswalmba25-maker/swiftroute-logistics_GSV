(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("en-IN"); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
  function msg(el, text, ok) { el.innerHTML = '<div class="msg ' + (ok ? "ok" : "err") + '">' + esc(text) + "</div>"; }

  /* Footer year */
  $("year").textContent = new Date().getFullYear();

  /* Mobile menu + active link */
  var burger = $("burger"), menu = $("menu");
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  });
  var links = menu.querySelectorAll("a:not(.btn)");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* Tracking */
  var STEPS = ["Order Confirmed", "Picked Up", "At Sorting Hub", "Out for Delivery", "Delivered"];
  var SHIP = {
    TRK1025: { customer: "Rahul Sharma", status: "In Transit", step: 2, loc: "Ahmedabad Distribution Hub", label: "Expected Delivery", val: "Today, 6:30 PM", partner: "Arjun Patel", vehicle: "GJ-01-AB-4521" },
    TRK1026: { customer: "Priya Mehta", status: "Out for Delivery", step: 3, loc: "Surat City Hub", label: "Expected Delivery", val: "Today, 4:30 PM", partner: "Rohan Shah", vehicle: "GJ-05-CD-7842" },
    TRK1027: { customer: "ABC Retail Pvt. Ltd.", status: "Delivered", step: 4, loc: "Vadodara", label: "Delivered At", val: "11:45 AM", partner: "Karan Singh" },
    TRK1028: { customer: "XYZ Electronics", status: "Delayed", step: 2, loc: "Ahmedabad", label: "Expected Delivery", val: "Tomorrow", reason: "Traffic congestion" }
  };
  var BADGE = { "In Transit": "b-blue", "Out for Delivery": "b-blue", Delivered: "b-ok", Delayed: "b-bad" };
  $("trackForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var id = $("orderId").value.trim().toUpperCase(), out = $("trackResult"), s = SHIP[id];
    if (!id || !s) { msg(out, "Shipment not found. Please check your Order ID.", false); return; }
    var rows = [["Order ID", id], ["Customer", s.customer], ["Status", '<span class="badge ' + BADGE[s.status] + '">' + s.status + "</span>"], ["Current Location", s.loc], [s.label, s.val]];
    if (s.partner) rows.push(["Delivery Partner", s.partner]);
    if (s.vehicle) rows.push(["Vehicle", s.vehicle]);
    if (s.reason) rows.push(["Reason", s.reason]);
    var dl = rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + (r[0] === "Status" ? r[1] : esc(r[1])) + "</dd>"; }).join("");
    var tl = STEPS.map(function (n, i) {
      var c = i < s.step ? "done" : i === s.step ? (s.step === 4 ? "done cur" : "cur") : "";
      return '<li class="' + c + '">' + n + "</li>";
    }).join("");
    out.innerHTML = '<div class="result"><dl>' + dl + '</dl><ol class="tl' + (s.status === "Delayed" ? " bad" : "") + '" aria-label="Shipment progress">' + tl + "</ol></div>";
  });

  /* Calculator */
  var CITIES = ["Ahmedabad", "Surat", "Vadodara", "Mumbai", "Delhi", "Bengaluru"];
  ["from", "to"].forEach(function (id, k) {
    $(id).innerHTML = CITIES.map(function (c) { return "<option>" + c + "</option>"; }).join("");
    if (k) $(id).selectedIndex = 1;
  });
  var SERVICE = { Standard: 0, Express: 100, Bulk: 350 };
  $("calcForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var km = parseFloat($("km").value), out = $("calcResult");
    if (!km || km <= 0) { msg(out, "Enter a distance in kilometres greater than 0.", false); return; }
    var base = 50, dist = Math.round(km * 0.6), wt = parseInt($("wt").value, 10), svc = SERVICE[$("type").value], total = base + dist + wt + svc;
    out.innerHTML = '<div class="result"><dl><dt>Route</dt><dd>' + $("from").value + " to " + $("to").value + "</dd><dt>Base Cost</dt><dd>&#8377;" + base + "</dd><dt>Distance Charge</dt><dd>&#8377;" + fmt(dist) + " (&#8377;0.60/km)</dd><dt>Weight Charge</dt><dd>&#8377;" + wt + "</dd><dt>Service Charge</dt><dd>&#8377;" + svc + " (" + $("type").value + ')</dd></dl><h3>Estimated Delivery Cost: &#8377;' + fmt(total) + '</h3><p class="note">This is an estimated price and may vary based on actual delivery conditions.</p><a href="#booking" class="btn btn-accent small">Book this delivery</a></div>';
  });

  /* Booking */
  document.querySelectorAll("[data-book]").forEach(function (b) {
    b.addEventListener("click", function () {
      $("bType").value = b.getAttribute("data-book");
      $("booking").scrollIntoView();
      $("bName").focus({ preventScroll: true });
    });
  });
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, PHONE = /^[+\d][\d\s-]{8,14}$/;
  $("bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var out = $("bookMsg");
    if (!["bName", "bFrom", "bTo", "bDate"].every(function (i) { return $(i).value.trim(); })) { msg(out, "Please fill in name, pickup, delivery location and date.", false); return; }
    if (!EMAIL.test($("bEmail").value.trim())) { msg(out, "Enter a valid email address.", false); return; }
    if (!PHONE.test($("bPhone").value.trim())) { msg(out, "Enter a valid phone number.", false); return; }
    msg(out, "Booking request received successfully! Your reference number is SR" + Math.floor(10000 + Math.random() * 90000) + ".", true);
    this.reset();
  });

  /* Enquiry */
  $("enqForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var out = $("enqMsg");
    if (!$("eName").value.trim() || !$("eMsg").value.trim()) { msg(out, "Please enter your name and message.", false); return; }
    if (!EMAIL.test($("eEmail").value.trim())) { msg(out, "Enter a valid email address.", false); return; }
    if (!PHONE.test($("ePhone").value.trim())) { msg(out, "Enter a valid phone number.", false); return; }
    msg(out, "Thank you. Your enquiry has been received. Our team will contact you shortly.", true);
    this.reset();
  });

  /* Dashboard (simulated data) */
  var DATA = {
    today: { total: 180, del: 150, tr: 22, dl: 8, csat: 4.4, labels: ["8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"], vals: [12, 28, 34, 30, 36, 28, 12] },
    week: { total: 1250, del: 1080, tr: 120, dl: 50, csat: 4.3, labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], vals: [160, 185, 210, 195, 230, 170, 100] },
    month: { total: 5300, del: 4640, tr: 430, dl: 230, csat: 4.2, labels: ["Week 1", "Week 2", "Week 3", "Week 4"], vals: [1240, 1390, 1310, 1360] }
  };
  var NAMES = { today: "time slot", week: "day", month: "week" };
  function render(p) {
    var d = DATA[p], ot = (d.del / d.total * 100).toFixed(1), dp = (d.dl / d.total * 100).toFixed(1);
    var k = [["&#128230;", fmt(d.total), "Total Orders"], ["&#9989;", fmt(d.del), "Delivered"], ["&#128666;", fmt(d.tr), "In Transit"], ["&#9888;&#65039;", fmt(d.dl), "Delayed"], ["&#9201;&#65039;", ot + "%", "On-Time Delivery"], ["&#11088;", d.csat + " / 5", "Customer Satisfaction"]];
    $("kpis").innerHTML = k.map(function (x) { return '<div class="card kpi"><div class="ico" aria-hidden="true">' + x[0] + "</div><div><b>" + x[1] + "</b><span>" + x[2] + "</span></div></div>"; }).join("");
    var a = d.del / d.total * 360, b = a + d.tr / d.total * 360;
    $("donut").style.background = "conic-gradient(#1a9b5b 0 " + a + "deg,#1d5fd1 " + a + "deg " + b + "deg,#d33a3a " + b + "deg 360deg)";
    $("legend").innerHTML = '<li><i style="background:#1a9b5b"></i>Delivered: ' + fmt(d.del) + '</li><li><i style="background:#1d5fd1"></i>In Transit: ' + fmt(d.tr) + '</li><li><i style="background:#d33a3a"></i>Delayed: ' + fmt(d.dl) + "</li>";
    var max = Math.max.apply(null, d.vals), mi = d.vals.indexOf(max);
    $("bars").innerHTML = d.vals.map(function (v, i) {
      return '<div class="' + (i === mi ? "max" : "") + '"><em>' + v + '</em><span style="height:' + Math.round(v / max * 85) + '%"></span>' + d.labels[i] + "</div>";
    }).join("");
    $("insights").innerHTML = "<li>On-time delivery is currently " + ot + "%.</li><li>Delayed shipments are " + dp + "% of total orders, a small share of volume.</li><li>" + d.labels[mi] + " recorded the highest delivery volume (" + fmt(max) + ").</li><li>Management should monitor delayed shipments and route congestion.</li>";
  }
  $("period").addEventListener("change", function () { render(this.value); });
  render("week");
})();
