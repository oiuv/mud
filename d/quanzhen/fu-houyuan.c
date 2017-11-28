inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
这里是后院。走到这里，花香味更加浓烈了。你仔细一看，
东南边有一道圆形门，似乎花香是从那里传出来的。从这里再
往南走，就是侯员外的卧室了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "southeast" : __DIR__"houhuayuan",
                "north" : __DIR__"fu-datang",
                "south" : __DIR__"fu-woshi",
        ]));
        setup();
        replace_program(ROOM);
}
