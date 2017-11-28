inherit ROOM;

void create()
{
        set("short", "相国寺");
        set("long", @LONG
大相国寺占地五百余亩，辖六十四个禅，律院，养僧千余。
是京城最大的寺院和全国佛教活动中心。门前『大相国寺』的
匾额乃是当今御笔亲书。大门敞开，多有行人来往。
LONG);
        set("objects", ([
  		__DIR__"npc/zhike" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"qianyuan",
  		"south" : __DIR__"jiedao",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
