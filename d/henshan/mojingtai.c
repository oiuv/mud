inherit ROOM;

void create()
{
        set("short", "磨镜台");
        set("long", @LONG
磨镜台位于燕子岩下，与半山亭一沟相邻。台前峰回路转，
台旁古松苍翠，环境清幽。相传南宗禅宗怀让在此宣扬「顿悟
法门」，坐台高僧斗法，怀让磨镜，智服北宗道一，此台因而
传名。「磨镜台之幽」是衡山大四绝之一。
LONG);
        set("exits", ([
                "southdown"  : __DIR__"shanlu8",
                "westup"     : __DIR__"shanlu7",
                "northup"    : __DIR__"shanlu6",
        ]));

        set("objects", ([
                __DIR__"npc/youke" : 2,
        ]));               
 
        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
