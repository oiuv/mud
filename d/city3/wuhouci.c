inherit ROOM;

void create()
{
	set("short", "诸葛亮殿");
	set("long", @LONG
这里是武侯祠正殿诸葛亮殿。武侯羽扇纶巾一如生前。两
边诸葛瞻和诸葛尚父子塑像也栩栩如生。挂在殿门两壁的，由
诗圣杜甫笔下流露的千古名联：“三顾频繁天下事，两朝开济
老臣心。”道尽了这个千古风范的一生心事。
LONG );
	set("exits", ([
	    "southdown" : __DIR__"liubeidian",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
