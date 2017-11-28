inherit ROOM;

void create()
{
        set("short", "花园");
        set("long", @LONG
这里是一个小花园，虽比不上富豪大院里的万紫千红，但
却也布置得精致可人。丐帮里显然不乏高雅之士。春天里桃花
盛开，夏日池塘里荷花田田，秋天里菊花争艳，冬天则是一片
香雪海。花园旁站着一位老丐，也不知道在干什么。
LONG);
        set("outdoors", "city");
        set("exits", ([
                "west"  : __DIR__"ma_xiaojing",
        ]));
        set("objects", ([
                CLASS_D("gaibang") + "/bai" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
