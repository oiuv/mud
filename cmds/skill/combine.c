// combine.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

mapping combine_list = ([

        // 镇狱惊天丸
        ({ "/clone/fam/max/xuanhuang-1",
           "/clone/fam/max/longjia-1",}) : "/clone/fam/max/zhenyu",
           //"/clone/fam/item/kunlun-1",
           //"/clone/fam/item/baxian-1",

        // 子午龙甲丹
        ({ "/clone/fam/pill/dimai-1",
           "/clone/fam/pill/renshen4-1",
           "/clone/fam/etc/lv7d-1", }) : "/clone/fam/max/longjia",

        // 玄黄紫箐丹
        ({ "/clone/fam/pill/yulu-1",
           "/clone/fam/pill/lingzhi4-1",
           "/clone/fam/etc/lv7a-1", }) : "/clone/fam/max/xuanhuang",

        // 地脉血泉
        ({ "/clone/fam/pill/puti2-1",
           "/clone/fam/pill/sheli3-1",
           "/clone/fam/etc/lv7b-1", }) : "/clone/fam/pill/dimai",

        // 天香玉露
        ({ "/clone/fam/pill/sheli2-1",
           "/clone/fam/pill/puti3-1",
           "/clone/fam/etc/lv7c-1", }) : "/clone/fam/pill/yulu",

        // 千年参心丹
        ({ "/clone/fam/pill/renshen1-1",
           "/clone/fam/pill/renshen2-1",
           "/clone/fam/etc/lv5c-1", }) : "/clone/fam/pill/renshen4",

        // 千年灵芝丸
        ({ "/clone/fam/pill/lingzhi1-1",
           "/clone/fam/pill/lingzhi2-1",
           "/clone/fam/etc/lv5c-1", }) : "/clone/fam/pill/lingzhi4",

        // 千年雪莲膏
        ({ "/clone/fam/pill/xuelian1-1",
           "/clone/fam/pill/xuelian2-1",
           "/clone/fam/etc/lv5c-1", }) : "/clone/fam/pill/xuelian4",

        // 百年参心丹
        ({ "/clone/fam/pill/renshen1-1",
           "/clone/fam/etc/lv5e-1", }) : "/clone/fam/pill/renshen3",

        // 百年灵芝丸
        ({ "/clone/fam/pill/lingzhi1-1",
           "/clone/fam/etc/lv5e-1", }) : "/clone/fam/pill/lingzhi3",

        // 百年雪莲膏
        ({ "/clone/fam/pill/xuelian1-1",
           "/clone/fam/etc/lv5e-1", }) : "/clone/fam/pill/xuelian3",

        // 昊天丹
        ({ "/clone/fam/pill/linghui1-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/linghui2",

        // 火龙果
        ({ "/clone/fam/pill/neili1-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/neili2",

        // 菩提子
        ({ "/clone/fam/pill/puti1-1",
           "/clone/fam/pill/puti2-1",
           "/clone/fam/pill/puti3-1", }) : "/clone/fam/pill/puti4",

        // 圣舍利
        ({ "/clone/fam/pill/sheli1-1",
           "/clone/fam/pill/sheli2-1",
           "/clone/fam/pill/sheli3-1", }) : "/clone/fam/pill/sheli4",

        // 帝者舍利
        ({ "/clone/fam/pill/sheli2-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/sheli3",

        // 冰菩提
        ({ "/clone/fam/pill/puti2-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/puti3",

        // 心菩提
        ({ "/clone/fam/pill/puti1-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/puti2",

        // 佛尊舍利
        ({ "/clone/fam/pill/sheli1-1",
           "/clone/fam/pill/full1-1", }) : "/clone/fam/pill/sheli2",

        // 忘情天书 新增4*85丹
        ({ "/clone/fam/gift/str3-1",
           "/clone/fam/gift/int3-1",
           "/clone/fam/gift/dex3-1",
           "/clone/fam/gift/con3-1", }) : "/clone/fam/max/tianshu1",

		    // 忘情天书
        ({ "/clone/fam/etc/lv5a-1",
           "/clone/fam/etc/lv5b-1",
           "/clone/fam/etc/lv5d-1",
           "/clone/fam/etc/lv7d-1",
           "/clone/fam/gift/str3-1", }) : "/clone/fam/max/tianshu1",

        // 忘情天书
        ({ "/clone/fam/etc/lv5a-1",
           "/clone/fam/etc/lv5b-1",
           "/clone/fam/etc/lv5d-1",
           "/clone/fam/etc/lv7d-1",
           "/clone/fam/gift/con3-1", }) : "/clone/fam/max/tianshu1",

        // 忘情天书
        ({ "/clone/fam/etc/lv5a-1",
           "/clone/fam/etc/lv5b-1",
           "/clone/fam/etc/lv5d-1",
           "/clone/fam/etc/lv7d-1",
           "/clone/fam/gift/int3-1", }) : "/clone/fam/max/tianshu1",

        // 忘情天书
        ({ "/clone/fam/etc/lv5a-1",
           "/clone/fam/etc/lv5b-1",
           "/clone/fam/etc/lv5d-1",
           "/clone/fam/etc/lv7d-1",
           "/clone/fam/gift/dex3-1", }) : "/clone/fam/max/tianshu1",

        // 五张九宵纹龍图碎片拼凑出完整的九宵纹龍图
        ({ "/clone/tattoo/spcs1-1",
           "/clone/tattoo/spcs1-2",
           "/clone/tattoo/spcs1-3",
           "/clone/tattoo/spcs1-4",
           "/clone/tattoo/spcs1-5" }) : "/clone/tattoo/spc1",

        // 五张凤舞九天图碎片拼凑出完整的凤舞九天图
        ({ "/clone/tattoo/spcs2-1",
           "/clone/tattoo/spcs2-2",
           "/clone/tattoo/spcs2-3",
           "/clone/tattoo/spcs2-4",
           "/clone/tattoo/spcs2-5" }) : "/clone/tattoo/spc2",

        // 五张万佛朝圣图碎片拼凑出完整的万佛朝圣图
        ({ "/clone/tattoo/spcs3-1",
           "/clone/tattoo/spcs3-2",
           "/clone/tattoo/spcs3-3",
           "/clone/tattoo/spcs3-4",
           "/clone/tattoo/spcs3-5" }) : "/clone/tattoo/spc3",

        // 五张百鬼夜行图碎片拼凑出完整的百鬼夜行图
        ({ "/clone/tattoo/spcs4-1",
           "/clone/tattoo/spcs4-2",
           "/clone/tattoo/spcs4-3",
           "/clone/tattoo/spcs4-4",
           "/clone/tattoo/spcs4-5" }) : "/clone/tattoo/spc4",

        // 五张托塔天王图碎片拼凑出完整的托塔天王图
        ({ "/clone/tattoo/spcs5-1",
           "/clone/tattoo/spcs5-2",
           "/clone/tattoo/spcs5-3",
           "/clone/tattoo/spcs5-4",
           "/clone/tattoo/spcs5-5" }) : "/clone/tattoo/spc5",

        // 五张千手观音图碎片拼凑出完整的千手观音图
        ({ "/clone/tattoo/spcs6-1",
           "/clone/tattoo/spcs6-2",
           "/clone/tattoo/spcs6-3",
           "/clone/tattoo/spcs6-4",
           "/clone/tattoo/spcs6-5" }) : "/clone/tattoo/spc6",

        // 五张锦绣山河图碎片拼凑出完整的锦绣山河图
        ({ "/clone/tattoo/spcs7-1",
           "/clone/tattoo/spcs7-2",
           "/clone/tattoo/spcs7-3",
           "/clone/tattoo/spcs7-4",
           "/clone/tattoo/spcs7-5" }) : "/clone/tattoo/spc7",

        // 五张后羿射日图碎片拼凑出完整的后羿射日图
        ({ "/clone/tattoo/spcs8-1",
           "/clone/tattoo/spcs8-2",
           "/clone/tattoo/spcs8-3",
           "/clone/tattoo/spcs8-4",
           "/clone/tattoo/spcs8-5" }) : "/clone/tattoo/spc8",

        // 五张九仪天尊图碎片拼凑出完整的九仪天尊图
        ({ "/clone/tattoo/spcs9-1",
           "/clone/tattoo/spcs9-2",
           "/clone/tattoo/spcs9-3",
           "/clone/tattoo/spcs9-4",
           "/clone/tattoo/spcs9-5" }) : "/clone/tattoo/spc9",

        // 五张冥皇炼狱图碎片拼凑出完整的冥皇炼狱图
        ({ "/clone/tattoo/spcs10-1",
           "/clone/tattoo/spcs10-2",
           "/clone/tattoo/spcs10-3",
           "/clone/tattoo/spcs10-4",
           "/clone/tattoo/spcs10-5" }) : "/clone/tattoo/spc10",

        // 三个钻石碎片合并成为一个钻石
        ({ "/clone/gift/cdiamond-1",
           "/clone/gift/cdiamond-2",
           "/clone/gift/cdiamond-3" }) : "/clone/gift/diamond",

        // 三个钻石合并成为一个精美钻石
        ({ "/clone/gift/diamond-1",
           "/clone/gift/diamond-2",
           "/clone/gift/diamond-3" }) : "/clone/gift/fdiamond",

        // 三个精美钻石合并成为一个神之钻石
        ({ "/clone/gift/fdiamond-1",
           "/clone/gift/fdiamond-2",
           "/clone/gift/fdiamond-3" }) : "/clone/gift/mdiamond",

        // 三个玛瑙碎片合并成为一个玛瑙
        ({ "/clone/gift/cagate-1",
           "/clone/gift/cagate-2",
           "/clone/gift/cagate-3" }) : "/clone/gift/agate",

        // 三个玛瑙合并成为一个精美玛瑙
        ({ "/clone/gift/agate-1",
           "/clone/gift/agate-2",
           "/clone/gift/agate-3" }) : "/clone/gift/fagate",

        // 三个精美玛瑙合并成为一个神之玛瑙
        ({ "/clone/gift/fagate-1",
           "/clone/gift/fagate-2",
           "/clone/gift/fagate-3" }) : "/clone/gift/magate",

        // 三个水晶碎片合并成为一个水晶
        ({ "/clone/gift/ccrystal-1",
           "/clone/gift/ccrystal-2",
           "/clone/gift/ccrystal-3" }) : "/clone/gift/crystal",

        // 三个水晶合并成为一个精美水晶
        ({ "/clone/gift/crystal-1",
           "/clone/gift/crystal-2",
           "/clone/gift/crystal-3" }) : "/clone/gift/fcrystal",

        // 三个精美水晶合并成为一个神之水晶
        ({ "/clone/gift/fcrystal-1",
           "/clone/gift/fcrystal-2",
           "/clone/gift/fcrystal-3" }) : "/clone/gift/mcrystal",

        // 三个翡翠碎片合并成为一个翡翠
        ({ "/clone/gift/cjade-1",
           "/clone/gift/cjade-2",
           "/clone/gift/cjade-3" }) : "/clone/gift/jade",

        // 三个翡翠合并成为一个精美翡翠
        ({ "/clone/gift/jade-1",
           "/clone/gift/jade-2",
           "/clone/gift/jade-3" }) : "/clone/gift/fjade",

        // 三个精美翡翠合并成为一个神之翡翠
        ({ "/clone/gift/fjade-1",
           "/clone/gift/fjade-2",
           "/clone/gift/fjade-3" }) : "/clone/gift/mjade",

        // 乾坤圣水
        ({ "/clone/fam/gift/int3-1",
           "/clone/fam/etc/lv7a-1",
           "/clone/fam/item/stone5-1" }) : "/clone/fam/item/bless_water",

        // 乾坤圣水
        ({ "/clone/fam/gift/con3-1",
           "/clone/fam/etc/lv7a-1",
           "/clone/fam/item/stone5-1" }) : "/clone/fam/item/bless_water",

        // 乾坤圣水
        ({ "/clone/fam/gift/dex3-1",
           "/clone/fam/etc/lv7a-1",
           "/clone/fam/item/stone5-1" }) : "/clone/fam/item/bless_water",

        // 乾坤圣水
        ({ "/clone/fam/gift/str3-1",
           "/clone/fam/etc/lv7a-1",
           "/clone/fam/item/stone5-1" }) : "/clone/fam/item/bless_water",

        // 辉石
        ({ "/clone/fam/item/stone3-1",
           "/clone/fam/item/stone1-1" }) : "/clone/fam/item/stone4",

        // 皓石
        ({ "/clone/fam/item/stone2-1",
           "/clone/fam/item/stone1-1" }) : "/clone/fam/item/stone3",


        // 辉月华石
        ({ "/clone/fam/item/stone1-1",
           "/clone/fam/item/stone4-1",
           "/clone/fam/item/stone3-1",
           "/clone/fam/item/stone2-1" }) : "/clone/fam/item/stone5",

       //取消饕餮特技后新增无字天书合成
       //无字天书
       ({ "/clone/fam/gift/str1-1",
          "/clone/fam/gift/int1-1",
          "/clone/fam/gift/con1-1",
          "/clone/fam/gift/dex1-1" }) : "/clone/fam/max/tianshu2",

      ({ "/clone/fam/gift/str2-1",
         "/clone/fam/gift/int2-1",
         "/clone/fam/gift/con2-1",
         "/clone/fam/gift/dex2-1", }) : "/clone/fam/gift/kardan",

        //新增无花果及85丹合成
        //许愿无花果，消除一次吃丹失败
       ({ "/clone/fam/gift/str3-1",
          "/clone/fam/gift/int3-1",
          "/clone/fam/gift/con3-1",
          "/clone/fam/gift/dex3-1",
          "/clone/fam/gift/str2-1",
          "/clone/fam/gift/int2-1",
          "/clone/fam/gift/con2-1",
          "/clone/fam/gift/dex2-1",
       }) : "/clone/fam/obj/guo",

     // 四个七成丹加一个五成丹合成一个8.5成丹(str)
       ({ "/clone/fam/gift/str2-1",
          "/clone/fam/gift/int2-1",
          "/clone/fam/gift/con2-1",
          "/clone/fam/gift/dex2-1",
          "/clone/fam/gift/str1-1",
        }) : "/clone/fam/gift/str3",

     // 四个七成丹加一个五成丹合成一个8.5成丹(int)
       ({ "/clone/fam/gift/str2-1",
          "/clone/fam/gift/int2-1",
          "/clone/fam/gift/con2-1",
          "/clone/fam/gift/dex2-1",
          "/clone/fam/gift/int1-1",
        }) : "/clone/fam/gift/int3",

     // 四个七成丹加一个五成丹合成一个8.5成丹(con)
       ({ "/clone/fam/gift/str2-1",
          "/clone/fam/gift/int2-1",
          "/clone/fam/gift/con2-1",
          "/clone/fam/gift/dex2-1",
          "/clone/fam/gift/con1-1",
        }) : "/clone/fam/gift/con3",

     // 四个七成丹加一个五成丹合成一个8.5成丹(dex)
       ({ "/clone/fam/gift/str2-1",
          "/clone/fam/gift/int2-1",
          "/clone/fam/gift/con2-1",
          "/clone/fam/gift/dex2-1",
          "/clone/fam/gift/dex1-1",
        }) : "/clone/fam/gift/dex3",

        /******************************************
                    镶嵌之物品--高级
        *******************************************/
        // 碧魄冰晶
       ({ "/clone/fam/etc/lv5f-1",
          "/clone/fam/etc/lv7c-1", // 青龙牙
          "/clone/fam/etc/lv7d-1", // 如意通天镢
          "/clone/fam/etc/lv7a-1", // 五彩玲珑珠
          "/clone/fam/etc/prize5-1", // 神聖血清
           }) : "/clone/fam/etc/bipo",

        // 幻石
       ({ "/clone/fam/item/baxian-1",
          "/clone/fam/item/kunlun-1",
          "/clone/fam/etc/lv7d-1",
          "/clone/fam/etc/lv7a-1",
          "/clone/fam/etc/prize5-1",
           }) : "/clone/fam/etc/huanshi",

        // 冰火珠
       ({ "/clone/fam/item/leihuo-1",
          "/clone/fam/item/lihuo-1",
          "/clone/fam/etc/lv5d-1", // 幻地神珠
          "/clone/fam/etc/lv7a-1",
          "/clone/fam/etc/prize5-1",
           }) : "/clone/fam/etc/binghuozhu",

        // 雷神珠
       ({ "/clone/fam/item/leihuo-1",
          "/clone/fam/etc/lv7c-1",
          "/clone/fam/etc/lv7d-1",
          "/clone/fam/etc/lv7a-1",
          "/clone/fam/etc/prize5-1",
           }) : "/clone/fam/etc/leishenzhu",

        /******************************************
                    镶嵌之物品--珍品
        *******************************************/
        // 神之寒晶·冰
       ({ "/clone/fam/etc/bipo-1",
          "/clone/fam/item/bless_water-1",
          "/clone/fam/etc/lv5d-1",
          "/clone/fam/etc/prize4-1",
           }) : "/clone/fam/etc/hanjing",

        // 魔之心·魔
       ({ "/clone/fam/etc/huanshi-1",
          "/clone/fam/item/bless_water-1",
          "/clone/fam/etc/lv5d-1",
          "/clone/fam/item/stone5-1",
           }) : "/clone/fam/etc/mozhixin",

        // 火之精灵·火
       ({ "/clone/fam/etc/binghuozhu-1",
          "/clone/fam/item/bless_water-1",
          "/clone/fam/etc/lv7d-1",
          "/clone/fam/etc/lv7b-1",
           }) : "/clone/fam/etc/huojingling",

        // 雷神之瞳·电
       ({ "/clone/fam/etc/leishenzhu-1",
          "/clone/fam/item/bless_water-1",
          "/clone/fam/etc/lv5d-1",
          "/clone/fam/item/zhenlong-1",
           }) : "/clone/fam/etc/leishentong",

]);

int main(object me, string arg)
{
        mapping same;                   // 判断重复的物品的需要的mapping
	string *item_list, *name_list;  // 合并的物品ID表和匹配的基本名字表
        string bname;                   // 物品对应的文件的基本名字
        object *ob_list;                // 合并的所有物品
        string *per;                    // mapping中记录的可合并的基本名字表
	object obj;                     // 生成的物品
        int mp, i;

	if (! arg)
                return notify_fail("你要合并什么物品？\n");

        if (me->is_busy())
                return notify_fail("先忙完了你的事情再做这件事情吧！\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，没时间做这些事情。\n");

        if (me->query("max_jingli") < 300)
                return notify_fail("你现在的精力修为有限，无法合成物品。\n");

        if (me->query("jingli") < 300)
                return notify_fail("你现在精力不济，无法合成物品。\n");

        item_list = explode(arg, "&");
        ob_list   = allocate(sizeof(item_list));
        name_list = allocate(sizeof(item_list));
        same = allocate_mapping(sizeof(item_list));
        for (i = 0; i < sizeof(item_list); i++)
        {
                bname = item_list[i];
                while (bname[0] == ' ') bname = bname[1..<0];
                while (bname[strlen(bname) - 1] == ' ') bname = bname[0..<2];
                ob_list[i] = present(bname, me);

                if (! objectp(ob_list[i]))
                        return notify_fail("你身上没有 " + bname + " 这种物品啊。\n");

                if (i > 0 && member_array(ob_list[i], ob_list[0..i - 1]) != -1)
                        return notify_fail("合并物品需要指明不同的物品，不要重复指"
                                           "明一件物品。\n");

                bname = base_name(ob_list[i]);
                if (undefinedp(same[bname]))
                        same[bname] = 1;
                else
                        same[bname]++;
                name_list[i] = bname + "-" + (string) same[bname];
        }

        tell_object(me, HIW "\n你双目微闭，将数样物品凝于掌中，运转内劲迫"
                        "使它们交融。\n" NOR);

        me->start_busy(1);
        me->add("jingli", -200);
        foreach (per in keys(combine_list))
        {
                if (per - name_list == ({ }) && sizeof(per) == sizeof(name_list))
                {
                        // 找到了合适的组合
                        obj = new(combine_list[per]);
                        for (i = 0; i < sizeof(ob_list); i++)
                        {
                                if (ob_list[i]->query_amount())
                                        ob_list[i]->add_amount(-1);
                                else
                                        destruct(ob_list[i]);
                        }
                        message("vision", HIW "\n霎时间只见" + me->name() + HIW "掌心一道"
                                          "光华闪过，但转瞬即逝，似乎发生了什么不同寻常的"
                                          "事情。\n\n" NOR, environment(me), ({me}));

                        tell_object(me, HIW "霎时间只见万道光华疾闪而过，你急忙摊开手掌，"
                                        "发现掌心\n豁然出现了一" + obj->query("unit") +
                                        obj->name() + HIW "，蕴漾着七色霞光。\n\n" NOR);

			if (obj->query("value"))
			{
				mp = (int)(obj->query("value") / 700);
				mp = 1 + random(mp);
				if (mp < 1) mp = 1;
				if (mp > 100) mp = 100;

	                        me->add("magic_points", mp);
			        tell_object(me, HIC "你通过合成"+ obj->name() + HIC "的历"
                                                "练过程，从而获得了" + chinese_number(mp) +
                                                "点灵慧。\n" NOR);
			}
                        me->add("max_jingli", -1);
                        obj->move(me, 1);
                        return 1;
                }
        }
        tell_object(me, HIR "可是过了半天，似乎没有任何变化，你不禁一声"
                        "长叹。\n" NOR);

        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : combine <特殊物品> & <特殊物品> & ……

这个指令可以让你将某些特殊物品合并成一种新的物品，哪些才能合
并？这就要靠你去发掘了。每次合并都会损失一点精力的上限。如果
要合并的几个物品名字相同，则需要指明他们的序号，比如有三个钻
石，如果要合一，则需要输入：

  combine diamond & diamond 2 & diamond 3

HELP);
    	return 1;
}
