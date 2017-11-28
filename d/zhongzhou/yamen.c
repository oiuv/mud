inherit ROOM;

void create()
{
        set("short", "中州衙门");
        set("long", @LONG
这就是中州县衙门，两旁的肃静和威武的牌子让你有点心
惊胆颤。两边的侍卫冷冷的看着你，看你要状告何人。
LONG);
        set("outdoors", "zhongzhou");
        set("exits", ([
                "east" : __DIR__"wendingbei3",
                "west" : __DIR__"zoulang",
                
        ]));

        set("objects", ([
	        __DIR__"npc/yayi" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
