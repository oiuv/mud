//Room: baodian.c

inherit ROOM;

void create ()
{
        set ("short", "大雄宝殿");
        set ("long", @LONG
大雄宝殿内，金壁辉煌，雕梁画洞，殿两侧共安放了六尊古佛，古
佛之後有释伽与天龙诸部的壁画。大雄宝殿为历朝皇帝招见僧侣、读经
念佛的所在，是以陈设与其馀诸殿大不相同，倒像是庄严肃穆的佛堂一
般。
LONG);
        set("exits", 
        ([ //sizeof() == 3
        	"north" : __DIR__"baoxiangsi",
        	"west" : __DIR__"piandian",
        	"east" : __DIR__"fangzhangshi",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/xiangke" : 2,
        ]));
	
        setup();
	replace_program(ROOM);
}
