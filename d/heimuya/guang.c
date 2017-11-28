inherit ROOM;

void create()
{
        set("short", "山谷");
        set("long", @LONG
这里是一处山谷，上面种植着草坪。南面不远便是日月神
教的青龙堂。向西有一条上山的石道。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"east" : __DIR__"linjxd5",
            	"southup" : __DIR__"qinggate",
            	"west" : __DIR__"shidao1",
        ]));
        set("objects",([
            	__DIR__"npc/kid" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
