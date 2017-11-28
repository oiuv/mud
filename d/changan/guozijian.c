//Room: guozijian.c

inherit ROOM;

void create ()
{
        set ("short", "国子监");
        set ("long", @LONG
国子监是朝廷培养人才的地方。高高低低的桌子排了两排。在这里
不时可以看到三三两两的学生模样的人大声争辩着什么问题，还有一些
老先生们蹙着眉头匆匆的走过，象是在思考着什么问题。
LONG);
        //set("item_desc", ([" *** " : " *** ", ]));

        set("exits", 
        ([ //sizeof() == 1
        	"south" : __DIR__"baihu3",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/xueshi" : 1,
	]));
              
        setup();
	replace_program(ROOM);
}
