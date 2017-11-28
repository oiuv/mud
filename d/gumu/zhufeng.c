
inherit ROOM;

void create()
{
        set("short", "终南山主峰");
        set("long", @LONG
此时你已身在终南山主峰，视野更为广阔。往低望去，群
山尽皆匍匐在脚下。重阳宫翠绿琉瓦在山腰处，晶莹生辉。不
少殿宇散布於山坳间，景色却颇为美妙。 一块巨石(shi)立在
一旁，似乎刻了什麽东西。往西和南各是一条山路。
LONG
        );
        set("item_desc", ([
                "shi"  :
"
                於人妄矫重异要佐子
                今传迹矫阳人伴汉房
                终入复英起与赤开志
                南道知雄全异松鸿亡
                山初非姿真书游举秦
                ，，，，，，，，，
                殿二收乘高造功屹曾
                阁仙心时视物成然进
                凌此活或仍不拂天桥
                烟相死割阔轻衣一下
                雾遇墓据步付去柱履
                。。。。。。。。。
"
        ]));
        set("outdoors", "quanzhen");
        set("exits", ([
                "westdown"  : __DIR__"shanlu2",
                "southdown" : __DIR__"shanlu1",
        ]));

        setup();
        replace_program(ROOM);
}
