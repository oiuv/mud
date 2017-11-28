inherit ROOM;

void create()
{
        set("short", "茅屋");
        set("long", @LONG
这是一件不大的茅屋，残破不全。向上望去可以看到点点阳光
洒降下来，难以想象这里下雨的日子会是怎样一番情景。
LONG );

        set("exits", ([
                "west" : "/d/kaifeng/shanlu2",
        ]));

        setup();
        replace_program(ROOM);
}
