"use strict";

function makeScalingExample(parentElement) {
    var parentHeight = 480;
    var parentWidth = 320;

    var context = new Slalom.MotionContext();
    var solver = context.solver();

    var scale = new c.Variable({name: 'scale'});

    var box = new Slalom.Box('');

    box.x = new c.Variable({name: 'x'});
    box.y = new c.Variable({name: 'y'});
    box.bottom = new c.Variable({name: 'bottom'});
    box.right = new c.Variable({name: 'right'});

    // Set these DOM layout properties on Box so that it'll use a CSS
    // transform to apply the scale.
    box.domWidth = parentWidth;
    box.domHeight = parentHeight;

    var width = c.minus(box.right, box.x);
    var height = c.minus(box.bottom, box.y);

    // The width and height are related: we must keep the aspect ratio.
    //
    //   width = height * aspect
    //
    var aspect = parentWidth / parentHeight;
    solver.add(eq(width, c.times(height, aspect), required));

    // The height is controlled by the scale.
    //
    //  height = scale * 480 (parentHeight)
    //
    solver.add(eq(height, c.times(scale, parentHeight), medium));

    // The bottom of the box is pinned to the bottom of the screen, like FB Paper.
    //
    //  bottom = 480 (parentHeight)
    //
    solver.add(eq(parentHeight, box.bottom, medium));

    // The box is centered horizontally.
    // 
    //  centerX := x + width/2
    //  centerX = 320/2 (parentWidth / 2)
    //
    var centerX = c.plus(box.x, c.times(width, 0.5));
    solver.add(eq(centerX, parentWidth/2, medium));

    // Motion constraints on scale. We express the constraints on other variables.
    // Use a physics model that doesn't overbounce.
    context.addMotionConstraint(new Slalom.MotionConstraint(scale, '>=', 0.45, { physicsModel: Slalom.MotionConstraint.criticallyDamped }));
    context.addMotionConstraint(new Slalom.MotionConstraint(scale, '<=', 1, { physicsModel: Slalom.MotionConstraint.criticallyDamped }));
    solver.add(eq(scale, 0.45, weak));

    parentElement.appendChild(box.element());
    context.addBox(box);
    context.addManipulator(createManipulator(box.y, parentElement, 'y'));
}
makeScalingExample(document.getElementById('scaling-example'));

