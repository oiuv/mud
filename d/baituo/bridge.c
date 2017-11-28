inherit ROOM;

void create()
{
        set("short", "小桥");
        set("long", @LONG
这是一座小竹桥，白驼山上的冰雪融化形成一条清澈的小
溪，从桥下缓缓流过。不时有顽皮的小鱼跃出水面，在阳光下
划出一条银白色的弧线。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "north" : __DIR__"guangchang",
                "east"  : __DIR__"xijie",
        ]));
        set("objects",([
                __DIR__"npc/cungu" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
