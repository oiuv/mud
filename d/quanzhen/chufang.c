inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这里是全真教的厨房，屋角上堆着一大堆手臂粗细的木柴，
看来还没有劈好。一位火工道人正愁眉苦脸地坐在那里，看着
那堆柴。墙上挂着一块牌子，墙边扔着一把柴刀。
LONG);

        set("exits",([
                "west" : __DIR__"shantang",
        ]));
        set("resource/water", 1);

        set("objects" , ([
                __DIR__"npc/huogong" : 1,
		"/d/wudu/obj/ganchai" : 2,
        ]));

        setup();
}
