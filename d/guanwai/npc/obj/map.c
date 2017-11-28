// map.c 峨嵋地图
#include <ansi.h>

inherit ITEM;

void create()
{
        set_name( HIC "『长白山旅游图』" NOR, ({ "luyou tu","tu","map"}) );
        set_weight(10);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long",
"\n                 『长白山导游图』\n\n"
"　　　【地图一】　　　　　　　　　   ＾\n"
"                                     ｜\n"
"                                     ＾\n"
"\n"
"\n"
"\n"
"                                                                     白\n"
" 大                                                                  云\n"
" 门                                                  鸡              峰\n"
" 坎＼二                                        铁    冠    鹿      ／  ＼\n"
" 子  门    满                                  壁 —    — 鸣＼玉／  天  ＼龙\n"
"     坎 — 天  谷    白    密    黑    夹      崖    砬    峰  柱          门\n"
"           星＼草 —    —    — 风 — 心      ｜    子        峰＼  池  ／峰\n"
"               垛    河    林    口    子      长                  ＼  ／\n"
"                                       ｜      白                    梯\n"
"                                       二＼半／瀑                    云\n"
"                                       龙  拉  布                    峰\n"
"                                       斗  瓢\n"
"\n"
"\n"
"　　　【地图二】\n"
"\n"
"                                        山神庙\n"
"                                       ／\n"
"                                    荒路          船厂 — 冰面 — 大门坎子\n"
"                                   ／              ｜\n"
"                小巷 — 北城    荒路        雪地—雪地\n"
"               ／        ｜      ｜        ／\n"
"          小土屋        集市 — 东城 — 雪地\n"
"                         ｜      ｜\n"
"              香肉馆 — 南城    土窑馆\n"
"                         ｜\n"
"                        木桥\n"
"                         ｜\n"
"                        大道\n"
"                         ｜\n"
"                        大道\n"
"                      ／\n"
"                   大道\n"
"                    ｜\n"
"                   宁远\n"
"                  ／\n"
"               官道\n"
"              ／\n"
"           官道\n"
"          ／\n"
"     山海关\n"
"          ＼\n"
"           老龙头\n"
"\n");
                set("value", 50);
                set("material", "paper");
        }
        setup();
}
