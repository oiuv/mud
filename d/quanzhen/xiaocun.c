inherit ROOM;

void create()
{
        set("short", "小村庄");
        set("long", @LONG
这是一片小村庄，隐藏在一个小山坳里。这里的居民们都
很少到城里去，虽然离武功镇不过是五、六里的山路，他们宁
愿秉承着男耕女纺织、日出而作日落而歇的老传统。日子虽然
清贫，却还算逍遥。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "northwest" : __DIR__"guchang",
                "southdown" : __DIR__"shanlu1",
        ]));
        setup();
        replace_program(ROOM);
}
