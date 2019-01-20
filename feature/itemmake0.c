// itemmake.c 自制道具

#include <dbase.h>
#include <ansi.h>
#include <name.h>
#include <move.h>
#include <command.h>

inherit F_OBSAVE;
inherit F_NOCLONE;

int is_item_make() { return 1; }

#define	LEVEL1		5
#define	LEVEL2		10
#define	LEVEL3		30
#define	LEVEL4		100
#define	LEVEL5		300
#define	LEVEL6		1000
#define	LEVEL7		3000
#define	LEVEL8		10000
#define	LEVEL9		50000
#define MAX_LEVEL       LEVEL9
#define ULTRA_LEVEL     (LEVEL9 + 1)

STATIC_VAR_TAG int *levels = ({ LEVEL1, LEVEL2, LEVEL3, LEVEL4,
                        LEVEL5, LEVEL6, LEVEL7, LEVEL8,
                        LEVEL9 });

STATIC_VAR_TAG int performing  = 0;
STATIC_VAR_TAG int attack_lvl  = 0;
STATIC_VAR_TAG int defense_lvl = 0;

int is_stay_in_room() { return attack_lvl >= ULTRA_LEVEL; }

string chinese_s(mixed arg)
{
      if (! stringp(arg))return "无";
      if (arg == "cold")return HIW "冰";
      if (arg == "fire")return HIR "火";
      if (arg == "magic")return HIY "魔";
      if (arg == "lighting")return HIM "电";
}


// 武器的主人ID - 通过文件的名字来判断
string item_owner()
{
        string owner;
        if (sscanf(base_name(this_object()), ITEM_DIR "%*s/%s-%*s", owner))
                return owner;

        return 0;
}

// 判断该武器是否被当前某人所持有
int is_not_belong_me(object me)
{
        string user;

	user = query("user");
        if (! user || ! sscanf(user, "%*s(" + me->query("id") + ")"))
                return 1;

        return 0;
}

// 武器装备的等级
int weapon_level()
{
        mapping o;
        string *ks;
        int lvl;
        int i;

        lvl = 0;
        o = query("owner");
        if (mapp(o))
        {
                ks = keys(o);
                for (i = 0; i < sizeof(ks); i++)
                        lvl += o[ks[i]];
        }

        lvl /= 100;
        if (lvl > MAX_LEVEL) lvl = MAX_LEVEL;

        if (lvl == MAX_LEVEL && query("magic/power"))
                // 具有魔法属性
                lvl = ULTRA_LEVEL;
        return lvl;
}

// 防御装备的等级
int armor_level()
{
        // More to be added
        return 0;
}

// 武器装备的长描述
string weapon_long()
{
        string  n;
        mapping c;
        int type;
        int k;
        int lvl;
        string tessera_name;
        string result;

        c = query("combat");
        n = query("unit") + name();
        if (! c)
                return "这" + n + "显然还没有饮过人血，上面纯洁无暇。\n";
        k = c["MKS"] + c["PKS"];

        if (c["WPK_GOOD"] < k / 2 &&
            c["WPK_BAD"]  < k / 2)
                type = 0;
        else
        if (c["WPK_GOOD"] > c["WPK_BAD"] * 2)
                type = -1;
        else
                type = 1;

        if (c["MKS"] + c["PKS"] < 10)
                return "这" + n + "看来已经用过人血开祭，上面隐现血痕。\n";

        attack_lvl = weapon_level();
        lvl = sizeof(levels);
        while (--lvl)
                if (attack_lvl >= levels[lvl])
                        break;
        lvl++;

        switch (type)
        {
        case 1:
                if (attack_lvl >= ULTRA_LEVEL)
                        result = HIY "它看上去平平常常，没有半点特殊，只是"
                                 "隐隐的让人感到那不凡的气质。\n" NOR;
                else
                if (attack_lvl >= MAX_LEVEL)
                        result = HIY "它看上去让人发自内心无限崇敬，一股"
                               "皓然正气悠然长存，颇具帝王风范，君临\n"
                               "天下，威镇诸路凶神恶煞、难道这就是传说中才"
                               "会出现的诸神之" + name() + HIY "？\n" NOR;
                else
                if (attack_lvl >= LEVEL8)
                        result = HIC "一眼望去，你觉得有无数的凶灵在疯狂"
                               "乱舞，哭天抢地，凄烈之极，似乎要重返\n"
                               "人间。你忍不住要长叹一声，昔日凶魔，也难逃死劫。\n" NOR;
                else
                if (attack_lvl >= LEVEL7)
                        result = HIC "它上面附着着不知多少凶魂，无数邪派"
                               "凶魔毙命于下，一股哀气犹然不散，让你\n"
                               "忍不住打了个冷战。\n" NOR;
                else
                if (attack_lvl >= LEVEL6)
                        result = HIR "它看上去令人惊心动魄，这就是名动江湖的" + name() + HIR
                               "，多少凶煞就此毙命，成就人间正义。\n" NOR;
                else
                if (attack_lvl >= LEVEL5)
                        result = HIR "它上面隐隐然透出一股血光，多年以来，许多"
                               "江湖上闻名一时的凶魔都成了" + name() + HIR "下的游魂。\n" NOR;
                else
                if (attack_lvl >= LEVEL4)
                        result = HIW "这就是江湖上著名的神兵之一：" + name() + HIW
                               "，穷凶极恶之徒见此物无不心驰神摇。\n" NOR;
                else
                if (attack_lvl >= LEVEL3)
                        result = HIW "这" + n + HIW "有一股正气散发出来，看来它下面凶魂不少。\n" NOR;
                else
                if (attack_lvl >= LEVEL2)
                        result = RED "这" + n + RED "隐然透出一股正气，"
                               "看来它杀了不少凶恶之徒。\n" NOR;
                else
                if (attack_lvl >= LEVEL1)
                        result = RED "细观之下，刃口有一丝血痕，想必是它杀人不少"
                               "，殷血于此吧！\n" NOR;
                else
                        result = CYN "看得出这" + n + CYN "曾经杀过不少凶恶之徒。\n" NOR;
                break;

        case -1:
                if (attack_lvl >= ULTRA_LEVEL)
                        result = HIR "它看上去平平常常，没有半点特殊，但是"
                                 "不知为何却总是让人感到有些不安。\n" NOR;
                else
                if (attack_lvl >= MAX_LEVEL)
                        result = HIR "它看上去让人打心底泛出阵阵寒意，隐"
                               "隐然上面似乎附着着无数冤魂，但是全然\n被这" + n + HIR
                               "上面的杀气所制，难道这就是传说中才会出现的邪神之" + name() + HIR
                               "？\n" NOR;
                else
                if (attack_lvl >= LEVEL8)
                        result = HIC "一眼望去，你觉得有无数的冤魂向你扑"
                               "来，哭天抢地，凄烈之极，你忍不住打了\n"
                               "个寒战，不敢再看第二眼。\n" NOR;
                else
                if (attack_lvl >= LEVEL7)
                        result = HIC "它上面附着着不知多少冤魂，无数高手"
                               "饮恨于下，一股怨气直冲霄汉，让你忍不\n"
                               "住打了个冷战。\n" NOR;
                else
                if (attack_lvl >= LEVEL6)
                        result = HIW "它看上去令人惊心动魄，这就是名动江湖的" + name() + HIW
                               "，不知多少英雄就此饮恨。\n" NOR;
                else
                if (attack_lvl >= LEVEL5)
                        result = HIW "它上面隐隐然透出一股血光，多年以来，许多"
                               "江湖上闻名一时的高手都成了" + name() + HIW "下的游魂。\n" NOR;
                else
                if (attack_lvl >= LEVEL4)
                        result = HIG "这就是江湖上著名的凶器之一：" + name() + HIG
                               "，谁曾想那么多仁人义士饮恨于下。\n" NOR;
                else
                if (attack_lvl >= LEVEL3)
                        result = HIG "这" + n + HIG "有一股戾气散发出来，看来它下面游魂不少。\n" NOR;
                else
                if (attack_lvl >= LEVEL2)
                        result = RED "这" + n + RED "隐然透出一股戾气，看来它杀了不少人。\n" NOR;
                else
                if (attack_lvl >= LEVEL1)
                        result = RED "细观之下，刃口有一丝血痕，想必是它杀人不少"
                               "，殷血于此吧！\n" NOR;
                else
                        result = CYN "看得出这" + n + CYN "曾经杀过不少侠义之士。\n" NOR;
                break;

        default:
                if (attack_lvl >= ULTRA_LEVEL)
                        result = HIC "它看上去平平常常，没有半点特殊，只是一件"
                                 "平凡之极的兵器而已。\n" NOR;
                else
                if (attack_lvl >= MAX_LEVEL)
                        result = HIC "它安然畅意，似乎就要腾空而去，跳出"
                               "三界，不入五行。世间万物，仿佛俱在它\n"
                               "霸气所及之处。冤魂不舞、群邪辟易，无不被这" + n + HIC
                               "上古神兵的霸气所制。\n" NOR;
                else
                if (attack_lvl >= LEVEL8)
                        result = HIM "一眼望去，你觉得有无数的游魂向你扑"
                               "来，哭天抢地，凄烈之极，你顿时觉得它\n"
                               "沉重无比，几乎拿捏不住。\n" NOR;
                else
                if (attack_lvl >= LEVEL7)
                        result = HIM "它上面附着着不知多少游魂，无数正邪"
                               "高手丧命于下，一股怨气哀愁油然不尽，\n"
                               "让你忍不住打了个冷战。\n" NOR;
                else
                if (attack_lvl >= LEVEL6)
                        result = HIR "它看上去令人惊心动魄，这就是名动江湖的" + name() + HIR
                               "，多少正邪高手都难逃此劫，堕入轮回。\n" NOR;
                else
                if (attack_lvl >= LEVEL5)
                        result = HIR "它上面隐隐然透出一股血光，多年以来，许多"
                               "江湖上闻名一时的高手都成了这" + n + HIR "下的游魂。\n" NOR;
                else
                if (attack_lvl >= LEVEL4)
                        result = HIW "这就是江湖上著名的利器之一：" + name() + HIW
                               "，谁能想到那么多高手饮恨于下。\n" NOR;
                else
                if (attack_lvl >= LEVEL3)
                        result = HIW "这" + n + HIW "有一股杀气散发出来，看来它下面游魂不少。\n" NOR;

                else
                if (attack_lvl >= LEVEL2)
                        result = RED "这" + n + RED "隐然透出一股杀气，看来它杀了不少人。\n" NOR;

                else
                if (attack_lvl >= LEVEL1)
                        result = RED "细观之下，刃口有一丝血痕，想必是它杀人不少"
                               "，殷血于此吧！\n" NOR;
                else
                        result = CYN "看得出这" + n + CYN "曾经杀过不少人。\n" NOR;
                break;
        }

        if (attack_lvl == ULTRA_LEVEL)
        {
                if (stringp(tessera_name = query("magic/tessera")))
                        result += "它上面镶嵌着" + tessera_name + "，闪烁着奇异的光芒。\n";
                result += HIY + name() + HIY "的等级：无上神品  LV10\n" NOR;
        } else
        if (lvl)
        {
                result += HIY + name() + HIY "的等级：" + lvl + "/9\n" NOR;

                if (query("magic/imbue_ok"))
                        result += HIM + name() + HIM "已经充分的浸入了，需要"
                                  "镶嵌以充分发挥威力。\n" NOR;
                else
                if ((n = query("magic/imbue")) > 0)
                        result += HIM + name() + HIM "已经运用灵物浸入了" +
                                  chinese_number(n) + "次，正在激发它的潜能。\n" NOR;
        }

              result += "-------------------------------------\n";
              result += HIW "坚固修正： " + query("bless") + "\t" NOR;
              result += HIW "攻·防修正：" + query("bless") * 2 + "\n" NOR;
              result += HIW "圣化次数： " + query("bless") + "\t" NOR;
              result += HIW "魔力改善值：" + query("magic/power") + "\n" NOR;
              result += HIW "魔力属性：" + chinese_s(query("magic/type"))  + "\t" NOR;
              result += HIW "人器融合度：" + query("magic/blood") + "\n" NOR;
              result += "-------------------------------------\n";

        return result;
}

// 是普通武器装备
int is_weapon()
{
        return stringp(query("skill_type"));
}

// 是空手武器装备
int is_unarmed_weapon()
{
        return query("armor_type") == "hands";
}

// 道具的长描述
string item_long()
{
        if (is_weapon() || is_unarmed_weapon())
                return weapon_long();

        return "";
}

// 武器装备的伤害值
int apply_damage()
{
        int d;
        int p;

        attack_lvl = weapon_level();
        p = query("point") / 2;
        d = attack_lvl * p / MAX_LEVEL + query("bless") * 2; // 乾坤圣水圣化一次增加2点攻击
        return d + p;
}

// 防御装备的有效值
int apply_armor()
{
        int d;
        int p;

        defense_lvl = armor_level();
        p = query("point");
        if (d > p * 3 / 2) d = p * 3 / 2 + query("bless") * 2;// 乾坤圣水圣化一次增加2点防御
        return d + p;
}

// 进行保存数据的接口函数
mixed save_dbase_data()
{
        mapping data;
        object  user;

        data = ([ "combat" : query("combat"),
                  "owner"  : query("owner"),
                  "magic"  : query("magic"),
                  "consistence" : query("consistence"), 
                  "bless"       : query("bless"),
                  "stable"      : query("stable")]);

        if (! (user = environment()))
                data += ([ "user" : query("user") ]);
        else
        if (playerp(user))
                data += ([ "user" : user->name(1) + "(" + user->query("id") + ")" ]);

        return data;
}

// 接受存盘数据的接口函数
int receive_dbase_data(mixed data)
{
        if (! mapp(data))
                return 0;

        if (mapp(data["combat"]))
                set("combat", data["combat"]);

        if (mapp(data["owner"]))
                set("owner", data["owner"]);

        if (mapp(data["magic"]))
                set("magic", data["magic"]);

        if (stringp(data["user"]))
                set("user", data["user"]);

        if (! undefinedp(data["consistence"]))
                set("consistence", data["consistence"]);

        if (intp(data["bless"]))
                set("bless", data["bless"]);

        if (intp(data["stable"]))
                set("stable", data["stable"]);


        return 1;
}

// 读取存盘的数据
int restore()
{
        int r;

        if (base_name(this_object()) + ".c" == __FILE__)
                return 0;

        r = ::restore();
        set("no_sell", 1);
        set("stable", query("stable"));
        set("bless", query("bless"));
        return r;
}

// 保存数据
int save()
{
//	int res;

        if (base_name(this_object()) + ".c" == __FILE__)
                return 0;

	return ::save();
}

// 9/10级兵器攻击对手
mixed weapon_hit_ob(object me, object victim, int damage_bonus)
{
//      int ap;
//      int dp;
//      int damage;

        if (attack_lvl < MAX_LEVEL ||
	    query("owner/" + me->query("id")) < MAX_LEVEL * 80)
                return;

        if (attack_lvl >= ULTRA_LEVEL &&
            mapp(query("magic")))
        {
                return ITEM_D->weapon10lv_hit_ob(me, victim, this_object(), damage_bonus);
        }

        return ITEM_D->weapon_hit_ob(me, victim, this_object(), damage_bonus);
}

// 以下的函数因为执行的频度并不高，而且具有高度重复的性质，
// 所以都调用ITEM_D中的执行程序。

// 杀了人以后的奖励
void killer_reward(object me, object victim)
{
	ITEM_D->killer_reward(me, victim, this_object());
}

// 呼唤物品
int receive_summon(object me)
{
	return ITEM_D->receive_summon(me, this_object());
}

// 隐藏物品
int hide_anywhere(object me)
{
        return ITEM_D->hide_anywhere(me, this_object());
}

// 追寻物品
int receive_miss(object me)
{
        if (! is_weapon() && ! is_unarmed_weapon())
        {
                write("你无法追寻" + name() + "。\n");
                return 0;
        }

        if (attack_lvl < ULTRA_LEVEL)
        {
                write(name() + "尚未通灵，你难以自如的感应。\n");
                return 0;
        }

	return ITEM_D->receive_miss(me, this_object());
}

// 插在地上
int do_stab(object me)
{
        return ITEM_D->do_stab(me, this_object());
}

// 特殊能力
int do_touch(object me)
{
        if (attack_lvl != ULTRA_LEVEL)
                return notify_fail("你摸了半天，好像没什么反应。\n");

        return ITEM_D->do_touch(me, this_object());
}

// 圣化
int do_san(object me)
{
        if ((is_weapon() || is_unarmed_weapon()) &&
            attack_lvl < MAX_LEVEL)
                return notify_fail("你的武器等级不到，无法圣化。\n");

        return ITEM_D->do_san(me, this_object());
}

// 浸透物品
int do_imbue(object me, object imbue)
{
        return ITEM_D->do_imbue(me, this_object(), imbue);
}

// 镶嵌物品
int do_enchase(object me, object tessera)
{
        return ITEM_D->do_enchase(me, this_object(), tessera);
}

int query_autoload() { return (query("equipped") ? query("equipped") : "kept"); }

void autoload(string parameter)
{
        switch (parameter)
        {
        case "worn":
                this_object()->wear();
                break;

        case "wielded":
                this_object()->wield();
                break;
        }
}