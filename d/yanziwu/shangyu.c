//ROOM: /d/yanziwu/shangyu.c

inherit ROOM;

int do_jump(string);

void create()
{
        set("short", "赏鱼台");
        set("long",@LONG
站在台上，你可以看见一片荷花菱角，不时有几尾金鱼跃
出水面，有的甚至还跳你眼前，仿佛一伸手就可以抓住。透过
荷叶隐约可以看到船坞，你不知是否有把握能跳过去。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
            "north": __DIR__"shuwu",
        ]));

        setup();
}
