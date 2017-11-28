inherit ROOM;

void create()
{
        set("short", "水塘");
        set("long", @LONG
行至此处，突然一阵清香涌至，眼前无边无际的全是水仙
花。原来地下是浅浅的一片水塘，深不逾尺，种满了水仙。由
于这绝情谷下生有温泉，以致地气奇暖这花虽是南方之物，也
会在这里的出现。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "east"   : __DIR__"shanlu1",
               "southdown" : __DIR__"shulin1",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
