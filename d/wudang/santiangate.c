inherit ROOM;

void create()
{
        set("short", "三天门");
        set("long", @LONG
这里是登山石阶的尽头三天门，再往上走就是武当绝顶了。
LONG);
        set("exits", ([
                "northdown": __DIR__"ertiangate",
                "southup"  : __DIR__"jinding",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
