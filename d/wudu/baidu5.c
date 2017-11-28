inherit ROOM;

string* npcs = ({
        "/clone/worm/changtuizhu",
        "/clone/worm/huabanzhu",
        "/clone/worm/baizuwugong",
        "/clone/worm/qianjiewugong",
        "/clone/worm/datouwugong",
        "/clone/worm/changaoxie",
        "/clone/worm/huibeixie",
});

void create()
{
        set("short", "百毒窟");
        set("long", @LONG
这里是一个天然形成的石洞，里面深邃广大。洞顶悬挂着许多钟
乳石，不时传来几声滴答的水声。走在洞中，洞内阴暗潮湿，身旁忽
然传来一阵“咝咝”的声音。
LONG );
        set("exits", ([
                "west" : __DIR__"baidu2",
        ]));
        set("objects", ([
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
        ]));

        setup();
        //replace_program(ROOM);
}
