inherit ROOM;

void create()
{
	set("short", "城西桥");
	set("long", @LONG
此桥高跨洛阳护城河之上，气势非凡。站在桥上向两侧望去，一条人
工开掘的护城河将洛阳城围在当中，桥身以汉白玉造就，既美观又很坚固。
桥上车水马龙，川流不息。桥下的护城河水清澈见底，时有游鱼跃起。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"xidoor",
  		"westdown" : __DIR__"guandaow1",
	]));

	setup();
	replace_program(ROOM);
}
