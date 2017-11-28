//Room: bingying2.c

inherit ROOM;

void create ()
{
        set ("short", "兵营");
        set ("long", @LONG
这里是一座临街而建的兵营，距离开封的北城门只有几步之遥。兵
营门口旌旗飘扬，偶尔可以看见兵士进出换岗，并且不动声色地寻视着
四周。兵营里面到处都有官兵来来回回地走动，有一名武将正在指挥士
兵列队操练。
LONG);
         set("exits", ([ /* sizeof() == 1 */
         	"northeast" : __DIR__"beian-daokou",
         ]));
         set("objects", ([ /* sizeof() == 5 */
         	__DIR__"npc/fujiang" : 1,
         	__DIR__"npc/guanbing" : 4,
         ]));

         set("outdoors", "changan");
         setup();
         replace_program(ROOM);
}
