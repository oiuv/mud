inherit ROOM;

void create()
{
  	set("short","长廊");
  	set("long", @LONG
这里是日月神教青龙堂内的长廊。只见长廊两边各站有数
十个刀斧手，警卫森严，透着腾腾杀气。
LONG);

	set("exits",([
        	"north" : __DIR__"dating3",
        	"south" : __DIR__"chlang2",
	]));
  	set("objects",([
     		__DIR__"npc/dizi5" : 2,
  	]));
  	setup();
  	replace_program(ROOM);
}
