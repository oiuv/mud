inherit ROOM;

void create()
{
        set("short", "火浣室");
        set("long", @LONG
这里便是绝情谷的火浣室。谷主规定每日有一个时辰焚烧
烈火。
LONG);
        set("exits", ([
               "south"   : __DIR__"shufang",
               "north"   : __DIR__"danfang",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
