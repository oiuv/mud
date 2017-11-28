inherit ROOM;

void create()
{
        set("short", "金殿");
        set("long", @LONG
金殿中间供着真武大帝铜像，披发跣足，体态丰满；左右
有金童玉女侍立，虔诚恭敬；水、火二将，威武庄严。殿前供
器皆为铜铸。殿宇和殿内铜像、供桌铆焊一体，构件精确，技
巧高超。
LONG);
        set("exits", ([
                "north" : __DIR__"zijincheng",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
