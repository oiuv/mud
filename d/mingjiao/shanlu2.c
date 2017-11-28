// Room: /d/mingjiao/shanlu2.c
// Date: Java 97/04/9

inherit ROOM;

void create()
{
	set("short", "青石阶");
	set("long", @LONG
眼前遽然出现一大片松林。松林长得极密，石阶转向北坡，上面
铺满了厚厚的金黄的松针。踩在脚下，发出察察的响声。一条窄小的
黄土小路继续向西延伸，进入树林深处，消失在茫茫林海之中。
LONG );
	set("exits", ([
		"eastdown" : __DIR__"shanlu1",
		"northup" : __DIR__"shanlu3",
		"west" : __DIR__"huangtulu1",
	]));
        set("objects",([
//             __DIR__"npc/xinran":1,
	]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}

