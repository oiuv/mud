inherit ROOM;

void create()
{
        set("short", "遇真宫");
        set("long", @LONG
这里是重阳宫以前的旧址，是王重阳王真人参悟大道之前
清修的地方。后来手创全真教后，此地的布局实在太小，就将
重阳宫迁到东面山上，将此地重新改名为遇真宫，以纪念得道
之意。这里很久没有人来过了，桌椅上都积满了灰尘。
LONG);
        set("exits", ([
                "south" : __DIR__"fangzhenqiao",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
