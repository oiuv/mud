//Room: piandian.c

inherit ROOM;

void create ()
{
  set ("short", "偏殿");
  set ("long", @LONG
偏殿里气氛宁静，灵台高筑，依次摆列着八菩萨的佛象。这里香火
也是不断，地上铺着一些蒲团。但见南面两侧一动也不动地盘坐著两名
枯瘦的老僧，左首那僧脸色通红，左手捏个拈花抉，右手合指朝天；右
首那僧却脸色青绿，右手捏著拈花抉，左手合指朝天。二僧姿式一模一
样，却偏生左右相反。东边殿门通向大雄宝殿，
LONG);

        set("exits", ([
        	"east"    : __DIR__"baodian",
        ]));

        set("objects", ([
        	__DIR__"npc/jingxuan" : 1,
        	__DIR__"npc/jingming" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
