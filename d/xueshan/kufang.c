inherit ROOM;

void create()
{
        set("short", "库房");
        set("long", @LONG
这里是练武场旁边的小库房，房里密不通风，只有一丝光
线从屋檐小缝中投射进来。房中有些备用的武器，都是雪山弟
子日常练功需要用到的兵器。
LONG);
        set("exits", ([
                "east" : __DIR__"chang",
        ]));
        set("objects", ([
                "/clone/weapon/zhujian" : random(2),
                "/clone/weapon/gangdao" : random(2),
                __DIR__"obj/mugun" : random(2),
                __DIR__"obj/falun" : random(2),
        ]));
        setup();
}
