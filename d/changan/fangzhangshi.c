//Room: fangzhangshi.c

inherit ROOM;

void create ()
{
        set ("short", "方丈室");
        set ("long", @LONG
方丈室很是朴素，房中除了一个木榻和一个书桌之外，再就别无他
物。书桌上放着几本关于佛经的书籍，还有一个破旧的木鱼。木榻上叠
有几方棉布薄被。西面通往大雄宝殿。
LONG);
        set("exits", 
        ([ //sizeof() == 1
        	"west" : __DIR__"baodian",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/huitong" : 1,
        ]));
        
        setup();
	replace_program(ROOM);
}
