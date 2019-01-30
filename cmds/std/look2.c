// #pragma optimize
// #pragma save_binary

#include <room.h>
#include <ansi.h>
#include <combat.h>
#include <armor.h>

// flag of func:look_all_inventroy_of_room/ret_str
#define SHOW_IMMEDIATELY        0
#define RETURN_RESULT           1

inherit F_CLEAN_UP;

//新增
#include <locate.h>

int look_room(object me, object env, int brief);
int look_item(object me, object obj);
int look_living(object me, object obj);
int look_room_item(object me, string arg);
string look_equiped(object me, object obj, string pro);
string look_all_inventory_of_room(object me, object env, int ret_str);


string gettof(object me, object obj);
string getdam(object me, object obj);
string tough_level(int power);

string *tough_level_desc = ({
        BLU "不堪一击" NOR,
        BLU "毫不足虑" NOR,
        BLU "不足挂齿" NOR,
        BLU "初学乍练" NOR,
        BLU "略知一二" NOR,
        HIB "粗通皮毛" NOR,
        HIB "初窥门径" NOR,
        HIB "勉勉强强" NOR,
        HIB "平平淡淡" NOR,
        HIB "初出茅庐" NOR,
        CYN "平淡无奇" NOR,
        CYN "半生不熟" NOR,
        CYN "普普通通" NOR,
        CYN "马马虎虎" NOR,
        CYN "略有小成" NOR,
        HIC "已有小成" NOR,
        HIC "鹤立鸡群" NOR,
        HIC "驾轻就熟" NOR,
        HIC "青出于蓝" NOR,
        HIC "融会贯通" NOR,
        HIG "心领神会" NOR,
        HIG "炉火纯青" NOR,
        HIG "了然于胸" NOR,
        HIG "略有大成" NOR,
        HIG "已有大成" NOR,
        YEL "豁然贯通" NOR,
        YEL "出类拔萃" NOR,
        YEL "无可匹敌" NOR,
        YEL "技冠群雄" NOR,
        YEL "神乎其技" NOR,
        HIY "出神入化" NOR,
        HIY "非同凡响" NOR,
        HIY "傲视群雄" NOR,
        HIY "登峰造极" NOR,
        HIY "无与伦比" NOR,
        RED "所向披靡" NOR,
        RED "一代宗师" NOR,
        RED "精深奥妙" NOR,
        RED "神功盖世" NOR,
        RED "举世无双" NOR,
        WHT "惊世骇俗" NOR,
        WHT "撼天动地" NOR,
        WHT "震古铄今" NOR,
        WHT "超凡入圣" NOR,
        WHT "威镇寰宇" NOR,
        HIW "空前绝后" NOR,
        HIW "天人合一" NOR,
        MAG "深藏不露" NOR,
        HIM "深不可测" NOR,
        HIR "返璞归真" NOR
});
string *heavy_level_desc= ({
        "极轻",
        "很轻",
        "不重",
        "不轻",
        "很重",
        "极重"
});

//测试代码开始（已成功）
string locate(string file)
{
        string domain_file;
        string *all_place;
        string the_place;
        
       if (sscanf(file, "/f/%*s")) 
               return "副本";

       domain_file = domain_file(file);
        
        if (! undefinedp(place[domain_file]))
        {
                all_place = place[domain_file][1];
                the_place = place[domain_file][0];
                if (member_array(file, all_place) != -1)                       
                        return the_place;
        }
        
        if (! undefinedp(region_names[domain_file]))
                return region_names[domain_file];
        
        return "未知区域";
}


//测试代码结束


void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object obj;
        object env;
        int result;
        string objid, where;

        if (! arg) result = look_room(me, environment(me), 0);
        else
        {
                if (sscanf(arg, "%s of %s", objid, where) == 2)
                {
                        if (where == "here")
                                obj = present(objid, environment(me));
                        else
                        if (where == "me")
                                obj = present(objid, me);
                        else
                        {
                                env = present(where, environment(me));
                                if (! objectp(env))
                                        return notify_fail("你要看哪里的东西？\n");
                                obj = present(objid, env);
                                if (env->is_character() && env != me)
                                {
                                        if (! objectp(obj) ||
                                            ! obj->query("equipped") &&
                                            env->query_temp("handing") != obj)
                                                return notify_fail("这人好像并没有漏出来你想看的东西啊。\n");
                                        message("vision", me->name() + "盯着你的" + obj->name() +
                                                "看了一会儿，不知道在打什么主意。\n", env);
                                        message("vision", me->name() + "盯着" + env->name() + "的" +
                                                obj->name() + "看了一会儿，不知道在打什么主意。\n",
                                                environment(me), ({ me, env }));
                                }
                        }

                        if (! obj)
                                return notify_fail("那里没有这样东西。\n");
                }        

                if( obj || (obj = present(arg, environment(me))) || (obj = present(arg, me)) )
                {
                        if( obj->is_character() && ! obj->is_corpse()) result = look_living(me, obj);
                        else result = look_item(me, obj);
                } else result = look_room_item(me, arg);
        }

        return result;
}

int look_room(object me, object env, int brief)
{
        int i;
        mapping exits;
        string str, *dirs;

        if( !env ) {
                tell_object(me, "你的四周灰蒙蒙地一片，什么也没有。\n");
                return 1;
        }

        if( !brief )
        {
                str = sprintf( HIC + "%s" + NOR + "%s\n    %s%s" + NOR,
                        env->short(),
                        wizardp(me)? " - " + file_name(env): " - ",
                        env->long(),
                        env->query("outdoors") ? NATURE_D->outdoor_room_description() : "");
        } else
        {
                str = sprintf( HIC + "%s" + NOR + "%s\n" + NOR,
                        env->short(),
                        wizardp(me)? " - " + file_name(env): "");
        }


        if (mapp(exits = env->query("exits")))
	{
                dirs = keys(exits);
                for(i=0; i<sizeof(dirs); i++)
                        if ((int)env->query_door(dirs[i], "status") & DOOR_CLOSED )
                                dirs[i] = 0;
                dirs -= ({ 0 });
                if (sizeof(dirs) == 0)
                        str += "    这里没有任何明显的出路。\n";
                else if (sizeof(dirs) == 1)
                        str += "    这里唯一的出口是 " + BOLD +
			       dirs[0] + NOR + "。\n";
                else
                        str += sprintf("    这里明显的出口是 " + BOLD + "%s" + NOR + " 和 " + BOLD + "%s" + NOR + "。\n",
                                implode(dirs[0..sizeof(dirs)-2], "、"), dirs[sizeof(dirs)-1]);
        }

        str += look_all_inventory_of_room(me, env, RETURN_RESULT);
        tell_object(me, str);
        
        return 1;
}

string desc_of_objects(object *obs)
{
        int i;

        string  str;
        mapping count;
        mapping unit;
        string  short_name;
        string  *dk;
        string league_name;

        if (obs && sizeof(obs) > 0)
        {
                str = "";
                count   = ([]);
                unit    = ([]);
    
                for (i = 0; i < sizeof(obs); i++)
                {
                        if (stringp(league_name = obs[i]->query("league/league_name")))
                        {
                               short_name = HIG + "「" + league_name + "」" + NOR + obs[i]->short();
                        }
                        else   short_name = obs[i]->short();
                        if (undefinedp(count[short_name]))
                        {
                                count += ([ short_name : 1 ]);
                                unit += ([ short_name : obs[i]->query("unit") ]);
                        }
                        else
                                count[short_name] += 1;
                }
    
                dk = sort_array(keys(count), 1);
                for (i = 0; i < sizeof(dk); i++)
                {
                        str += "  ";
                        if (count[dk[i]] > 1)
                                str += chinese_number(count[dk[i]]) + unit[dk[i]];
                        str += dk[i] + "\n";
                }
                return str;
        }

        return "";
}

string look_all_inventory_of_room(object me, object env, int ret_str)
{
        object *inv;
        object *obs;

        string  str;

        if (! env || ! me) return "";

        str = "";

        inv = all_inventory(env);
        if (! sizeof(inv)) return str;

        obs = filter_array(inv, (: $(me) != $1 && userp($1) && $(me)->visible($1) :));
        str += desc_of_objects(obs);

        obs = filter_array(inv, (: $(me) != $1 && ! userp($1) && $1->is_character() &&
                                   $(me)->visible($1) :));
        str += desc_of_objects(obs);

        obs = filter_array(inv, (: ! $1->is_character() :), me);
        str += desc_of_objects(obs);

        if (! ret_str)
                tell_object(me, str);

        return str;
}


/*
int look_item(object me, object obj)
{
        object hob;
        mixed *inv;
        mapping count;
        mapping equiped;
        mapping unit;
        string short_name;

        string str;
        string *dk;
        int i;

        count   = ([]);
        unit    = ([]);
        equiped = ([]);

        str = obj->long();
        while (mapp(obj->query_temp("daub")))
        {
                if (! obj->query_temp("daub/poison/remain"))
                        // no poison remain now
                        break;

                if (obj->query_temp("daub/poison/id") == me->query("id"))
                {
                        str += HIG "你发现这上面还有你炼制的" +
                               obj->query_temp("daub/poison/name") +
                               HIG "呢。\n" NOR;
                        break;
                }

                if (obj->query_temp("daub/who_id") == me->query("id"))
                {
                        str += HIG "这上面还有你亲手布下的" +
                               obj->query_temp("daub/poison/name") +
                               HIG "呢。\n" NOR;
                        break;
                }

                if (random(4) && random((int)me->query_skill("poison", 1)) < 30)
                        // nothing was worked out
                        break;

                str += HIG "忽然间你发现上面似乎泛着一些奇异荧光";
                if (me->query_skill("poison", 1) >= 120)
                {
                        str += "，可能是" + obj->query_temp("daub/poison/name");
                }

                str += "。\n" NOR;
                break;
        }

        if (obj->query("consistence"))
                str += sprintf(HIW"耐 久 度 :" HIW " %d%%\n" NOR, obj->query("consistence"));

        inv = all_inventory(obj);
        if (! sizeof(inv))
        {
                message("vision", str, me);
                return 1;
        }

        if (obj->is_corpse())
        {
                if (objectp(hob = obj->query_temp("handing")))
                {
                        if (hob->query_amount())
                                str += "手中还死死握着一" + hob->query("base_unit") +
                                       hob->name() + "，";
                        else
                                str += "手中还死死握着一" + hob->query("unit") +
                                       hob->name() + "，";
                        inv -= ({ hob });
                        if (! sizeof(inv))
                                str += "没有什么其他遗物了。\n";
                        else
                                str += "里面的遗物有：\n";
                } else
                        str += "里面的遗物有：\n";
        } else
                str += "里面有：\n";

        for (i = 0; i < sizeof(inv); i++)
        {
                short_name = inv[i]->short();
                if (undefinedp(count[short_name]))
                {
                        count += ([ short_name : 1 ]);
                        unit += ([ short_name : inv[i]->query("unit") ]);
                }
                else
                        count[short_name] += 1;

                if (inv[i]->query("equipped"))
                        equiped[short_name] = 1;
        }

        dk = keys(count);
        dk = sort_array(dk, 1);
        for (i = 0; i < sizeof(dk); i++)
        {
            if (equiped[dk[i]])
                str += HIC "  □" NOR;
            else
                str += "    ";

            if (count[dk[i]] > 1)
                str += chinese_number(count[dk[i]]) + unit[dk[i]];
            str += dk[i] + "\n";
        }

        if (strlen(str) > 4096)
                me->start_more(str);
        else
                message("vision", str, me);
        return 1;
}
*/


int look_item(object me, object obj)
{
        object hob;
        mixed *inv;
        mapping count;
        mapping equiped;
        mapping unit;
//      mapping *inset;
        string short_name;

        string str;
        string *desc;
        string *dk;
        //mapping special_prop, applied_prop;
        mapping special_prop;
        mapping applied_prop;
        //string *apply, *apply1, *apply2, *apply3;
        string *apply;
        string *apply1;
        string *apply2;
        string *apply3;
        int i;
        int f;
//      int n;

        count   = ([]);
        unit    = ([]);
        equiped = ([]);
        special_prop = ([]);
        applied_prop = ([]);
        apply = ({});
        apply1 = ({});
        apply2 = ({});
        apply3 = ({});
                
        str = obj->long();
 /*if (obj->query("no_identify"))
        {
                str += "-------------------------------------\n";
                str += HIC "此物品未鉴定\n" NOR;
                str += "-------------------------------------\n";
        } else*/
        if (mapp(obj->query("weapon_prop")) ||mapp(obj->query("armor_prop")))
           {
                if (obj->query("skill_type"))
                        applied_prop = obj->query("weapon_prop");
                else
                if (obj->query("armor_type"))
                        applied_prop = obj->query("armor_prop");
                  /*      
                if (arrayp(apply1) && sizeof(apply1) > 0) {
                        str += "---------------兵器附加--------------\n";
                        for (i = 0; i<sizeof(apply1); i++)
                        {
                                f = obj->query("enchase/wspe_data")[apply1[i]];
                                desc = ENCHASE_D->special_desc(apply1[i]);

                                str += sprintf(HIC "%s%5s%-5d\n" NOR, desc,
                                 //              f > 0 ? "+" : "-", abs(f));
                                  f > 0 ? "+" : "",f);
                        }
                        str += "\n";
                }

                if (arrayp(apply2) && sizeof(apply2) > 0) {
                        str += "---------------防具附加--------------\n";
                        for (i = 0; i<sizeof(apply2); i++)
                        {
                                f = obj->query("enchase/aspe_data")[apply2[i]];
                                desc = ENCHASE_D->special_desc(apply2[i]);

                                str += sprintf(HIC "%s%5s%-5d\n" NOR, desc,
                                 //              f > 0 ? "+" : "-", abs(f));
                                  f > 0 ? "+" : "",f);
                        }
                        str += "\n-------------------------------------\n";
                }
          if (mapp(obj->query("enchase/spe_data")))
                        special_prop += obj->query("enchase/spe_data");
                     */   
                if (mapp(applied_prop) && sizeof(applied_prop) > 0)
                        apply3 = keys(applied_prop);                        
                if (arrayp(apply3) && sizeof(apply3) > 0)
                {
                        for (i = 0; i<sizeof(apply3); i++)
                        {
                                if (undefinedp(special_prop[apply3[i]]))
                                        special_prop[apply3[i]] = applied_prop[apply3[i]];
                                else
                                        special_prop[apply3[i]] += applied_prop[apply3[i]];
                        }
                }
                if (mapp(special_prop) && sizeof(special_prop) > 0)
                        apply = keys(special_prop);
                if (arrayp(apply) && sizeof(apply) > 0) {
                        str += "---------------附加属性--------------\n";
                        for (i = 0; i<sizeof(apply); i++)
                        {
                                f = special_prop[apply[i]];
                                desc = ENCHASE_D->special_desc(apply[i]);

                    		str += sprintf(HIC "%s%10s%-5d\n" NOR, desc,
                         //                      f > 0 ? "+" : "-", abs(f));
                         f > 0 ? "+" : "-",abs(f));
                        }
                }
                str += "\n-------------------------------------\n";
        }
       
        while (mapp(obj->query_temp("daub")))
        {
                if (! obj->query_temp("daub/poison/remain"))
                        // no poison remain now
                        break;

                if (obj->query_temp("daub/poison/id") == me->query("id"))
                {
                        str += HIG "你发现这上面还有你炼制的" +
                               obj->query_temp("daub/poison/name") +
                               HIG "呢。\n" NOR;
                        break;
                }

                if (obj->query_temp("daub/who_id") == me->query("id"))
                {
                        str += HIG "这上面还有你亲手布下的" +
                               obj->query_temp("daub/poison/name") +
                               HIG "呢。\n" NOR;
                        break;
                }

                if (random(4) && random((int)me->query_skill("poison", 1)) < 30)
                        // nothing was worked out
                        break;

                str += HIG "忽然间你发现上面似乎泛着一些奇异荧光";
                if (me->query_skill("poison", 1) >= 120)
                {
                        str += "，可能是" + obj->query_temp("daub/poison/name");
                }

                str += "。\n" NOR;
                break;
        }

        if (obj->query("consistence"))
                str += sprintf("耐久度：" WHT "%d%%\n" NOR, obj->query("consistence"));

        inv = all_inventory(obj);
        if (! sizeof(inv))
        {
                message("vision", str, me);
                return 1;
        }

        if (obj->is_corpse())
        {
                if (objectp(hob = obj->query_temp("handing")))
                {
                        if (hob->query_amount())
                                str += "手中还死死握着一" + hob->query("base_unit") +
                                       hob->name() + "，";
                        else
                                str += "手中还死死握着一" + hob->query("unit") +
                                       hob->name() + "，";
                        inv -= ({ hob });
                        if (! sizeof(inv))
                                str += "没有什么其他遗物了。\n";
                        else
                                str += "里面的遗物有：\n";
                } else
                        str += "里面的遗物有：\n";
        } else
                str += "里面有：\n";

        for (i = 0; i < sizeof(inv); i++)
        {
                short_name = inv[i]->short();
                if (undefinedp(count[short_name]))
                {
                        count += ([ short_name : 1 ]);
                        unit += ([ short_name : inv[i]->query("unit") ]);
                }
                else
                        count[short_name] += 1;

                if (inv[i]->query("equipped"))
                        equiped[short_name] = 1;
        }

        dk = keys(count);
        dk = sort_array(dk, 1);
        for (i = 0; i < sizeof(dk); i++)
        {
            if (equiped[dk[i]])
                str += HIC "  □" NOR;
            else
                str += "    ";

            if (count[dk[i]] > 1)
                str += chinese_number(count[dk[i]]) + unit[dk[i]];
            str += dk[i] + "\n";
        }

        if (strlen(str) > 4096)
                me->start_more(str);
        else
                message("vision", str, me);
        return 1;
}

string look_equiped(object me, object obj, string pro)
{
        mixed *inv;
        string str;
        string subs;
        object hob;
        int i;
        int n;

        inv = all_inventory(obj);
        n = 0;

        str = "";
        subs = "";
        for (i = 0; i < sizeof(inv); i++)
        {
                switch (inv[i]->query("equipped"))
                {
                case "wielded":
                        n++;
                        subs = HIC "  □" NOR + inv[i]->short() + "\n" + subs;
                        break;

                case "worn":
                        n++;
                        subs += HIC "  □" NOR + inv[i]->short() + "\n";
                        break;

                default:
                        break;
                }
        }

        if (n)
                str += pro + "装备着：\n" + subs;

        if (objectp(hob = obj->query_temp("handing")))
        {
                int mad;

                // dress nothing but handing a cloth !
                mad = (! objectp(obj->query_temp("armor/cloth")) &&
                       hob->query("armor_type") == "cloth");

                str = pro + "手中" + (mad ? "却" : "" ) + "握着一" +
                      (hob->query_amount() ? hob->query("base_unit")
                                           : hob->query("unit")) +
                      hob->name() +
                      (mad ? "，疯了，一定是疯了！\n" : "。\n") + str;
        }

        if (playerp(obj) &&
            ! objectp(obj->query_temp("armor/cloth")))
        {
                str = pro + "身上没有穿衣服啊！\n" + str;
        }

        return str;
}

string getdam(object me, object obj)
{

        int level;
        level = obj->query_temp("apply/damage");
        level = level / 50;
                        if( level >= sizeof(heavy_level_desc) )
                                level = sizeof(heavy_level_desc)-1;
                        return heavy_level_desc[((int)level)];
}
string gettof(object me, object ob)
{
        object weapon;
        string skill_type,parry_type;
        int attack_points;
        if( objectp(weapon = ob->query_temp("weapon")) )
        {
                skill_type = weapon->query("skill_type");
                parry_type = "parry";
        }
        else
        {
                skill_type = "unarmed";
                parry_type = "unarmed";
        }

          attack_points = COMBAT_D->skill_power(ob, skill_type, SKILL_USAGE_ATTACK)/25;
        return  tough_level(attack_points);
}
string tough_level(int power)
{

        int lvl;
        int rawlvl;
        int grade = 1;
        if(power<0) power=0;
        rawlvl = (int) pow( (float) 1.0 * power, 0.3);
        lvl = to_int(rawlvl/grade);
                        if( lvl >= sizeof(tough_level_desc) )
                                lvl = sizeof(tough_level_desc)-1;
                        return tough_level_desc[((int)lvl)];
}

string description(object obj)
{
        if (playerp(obj))
        {
            int per;
            int age;
            per = obj->query_per();
            age = obj->query("age");
            if (obj->query("special_skill/youth")) age = 14;
            if ((string) obj->query("gender") == "男性" || (string) obj->query("gender") == "无性")
            {
                    if (per >= 30) return "长得宛如玉树临风，风流倜傥，顾盼之间，神采飞扬。真正是人中龙凤！\n";
                    if (per >= 28) return "英俊潇洒，气宇轩昂，风度翩翩，面目俊朗，貌似潘安。\n";
                    if (per >= 24) return "相貌英俊，仪表堂堂。骨格清奇，丰姿非俗。\n";
                    if (per >= 18) return "五官端正。\n";
                    if (per >= 15) return "相貌平平。没什么好看的。\n";
                                   return "长得有点对不住别人。\n";
            } else
            {
                    if (per >= 30) return "有倾国倾城之貌，容色丽郁，娇艳绝伦，堪称人间仙子！\n长发如云，肌肤胜雪，风华绝代，不知倾倒了多少英雄豪杰。\n";
                    if (per >= 28) return "清丽绝俗，风姿动人。有沉鱼落雁之容，避月羞花之貌！\n俏脸生春，妙目含情，顾盼神飞，轻轻一笑，不觉让人怦然心动。\n";
                    if (per >= 26) return "肤如凝脂，眉目如画，风情万种，楚楚动人。当真是我见犹怜！\n";
                    if (per >= 24) return "容色秀丽，面带晕红，眼含秋波。举手投足之间，确有一番风韵。\n";
                    if (per >= 21) return "气质高雅，面目姣好，虽算不上绝世佳人，也颇有几分姿色。\n";
                    if (per >= 18) return "相貌平平，还看得过去。\n";
                    if (per >= 15) return "相貌马马虎虎。\n";
                                   return "长得和无盐有点相似耶。\n";
            }
        } else
        if (! obj->query("can_speak") && living(obj))
        {
                if (! obj->query_temp("owner"))
                        return "是一只未被驯服的畜生，眼光里满是戒心和敌意。\n";
                else
                        return "是一只被" + obj->query_temp("owner_name") +
                               "驯服的畜生，一副很温驯的样子。\n";
        }

        return "";
}

int look_living(object me, object obj)
{
        int per;
//      int spi;
        int age;
//      int weight;
        string str/*, limb_status*/, pro, desc;
//      mixed *inv;
        mapping my_fam, fam;
        int me_shen, obj_shen;
        string league_name;

        obj_shen = (int)obj->query("shen");
        per = obj->query_per();
        age = obj->query("age");
        pro = (obj==me) ? gender_self(obj->query("gender")) : gender_pronoun(obj->query("gender"));

        if (playerp(obj) && ! (obj->query("born")))
        {
                tell_object(me, pro + "还没有投胎，只有一股元神，什么都看不到耶！\n");
                return 1;
        }

        me_shen = (int)me->query("shen");
        if (me != obj)
	{
                message("vision", me->name() + "正盯著你看，不知道在打"
			"什么主意。\n", obj);
		message("vision", me->name() + "盯着" + obj->name() +
			"看了一会儿，不知道在打什么主意。\n", 
			environment(me), ({ me, obj }));
	}

        if (stringp(league_name = obj->query("league/league_name")))
        {
                  str = HIG + "「" + league_name + "」" + NOR + obj->long();
        }
        else str = obj->long();
        if (me != obj && objectp(obj->query_temp("is_riding")))
                str += sprintf("%s正骑在%s上，低头看着你。\n", pro, obj->query_temp("is_riding")->name());

        if (obj->is_character() &&
            obj->query("can_speak"))
        {
                // 是人物角色
                if (age >= 25 && obj->query("special_skill/youth"))
                        str += pro + "看不出年纪的大小，好像只有二十多岁。\n";
                else
                {
                        if (age >= 200)
                                str += pro + "看起来年纪很大了，难以估计。\n";
                        else
                        if (age < 10)
                                str += pro + "看起来年纪尚幼。\n";
                        else
                                str += pro + "看起来有" + chinese_number(age / 10 * 10) +
                                       "多岁。\n";
                }
        }

        desc = description(obj);
        if (desc && desc != "")
                str += pro + desc;

       	// 检查人物的刺青纹身情况
       	if (obj->is_character()
       	   && obj->query("tattoo"))
       	{
       		str += pro;

                // 检查角色脸部的刺青情况
       	        if (obj->query("tattoo/face_long"))
       	        {
       	                str += "的脸上刺有" +  obj->query("tattoo/face_long") + "。\n";

       	        	if (((obj->query("tattoo/chest_long")
       	           	   || obj->query("tattoo/back_long"))
       	           	   && ! objectp(obj->query_temp("armor/cloth")))
       	           	   || obj->query("tattoo/leftarm_long")
       	           	   || obj->query("tattoo/rightarm_long"))
                        	str += pro;
                }


                // 检查躯体前后的刺青情况，如果一样则修正描述
       	        if ((obj->query("tattoo/chest_long")
       	           == obj->query("tattoo/back_long"))
       	           && obj->query("tattoo/chest_long")
       	           && obj->query("tattoo/back_long")
       	           && ! objectp(obj->query_temp("armor/cloth")))
       	        {
       	                str += "裸露出的胸口和背部都刺有" +
       	                       obj->query("tattoo/chest_long") + "。\n";
       	        } else
       	        {
       	        	if (obj->query("tattoo/chest_long")
       	                   && ! objectp(obj->query_temp("armor/cloth")))
       	                	str += "裸露出的胸口上刺有" +
       	                               obj->query("tattoo/chest_long") + "。\n";

       	        	if (obj->query("tattoo/back_long")
       	                   && ! objectp(obj->query_temp("armor/cloth")))
       	        	{
       	                	if (obj->query("tattoo/chest_long"))
       	                        	str += "而" + pro + "的背部还刺有" +
       	                                       obj->query("tattoo/back_long") + "。\n";
       	                	else
       	                        	str += "裸露出的背部刺有" +
       	                                       obj->query("tattoo/back_long") + "。\n";
       	        	}
       	        }

                // 检查左右手臂的刺青情况，如果一样则修正描述
       	        if ((obj->query("tattoo/leftarm_long")
       	           == obj->query("tattoo/rightarm_long"))
       	           && obj->query("tattoo/leftarm_long")
       	           && obj->query("tattoo/rightarm_long"))
       	        {
       	                str += "结实的双臂上都刺有" +
       	                       obj->query("tattoo/leftarm_long") + "。\n";
       	        } else
                {
       	        	if (obj->query("tattoo/leftarm_long"))
       	                	str += "结实的左臂上刺有" +
       	                               obj->query("tattoo/leftarm_long");

       	        	if (obj->query("tattoo/rightarm_long"))
       	        	{
       	                	if (obj->query("tattoo/leftarm_long"))
       	                        	str += "，而右臂则刺有" +
       	                                       obj->query("tattoo/rightarm_long") + "。\n";
       	                	else
       	                        	str += "结实的右臂上刺有" +
       	                                       obj->query("tattoo/rightarm_long") + "。\n";
       	        	} else
       	        	if (obj->query("tattoo/leftarm_long"))
       	                	str += "。\n";
       	        }
       	}
		str +=sprintf("%s武功看起来好象", pro);
		str+=gettof(me,obj);
		str += sprintf("，");
		str +=sprintf("出手似乎");
		str +=getdam(me,obj);
		str += sprintf("。\n");
        //check about wife and husband
        if (obj->query("id")== me->query("couple/id"))
        {
                // 夫妻关系
                if ((string)me->query("gender") == "女性")
                        str += sprintf("%s就是你的夫君。\n", pro);
                else
                        str += sprintf("%s就是你的妻子。\n", pro);
        } else
        if (obj->is_brother(me))
        {
                // 兄弟
                if (obj->query("gender") == "女性")
                {
                        if (obj->query("mud_age") > me->query("mud_age"))
                                str += sprintf("%s是你的义姐。\n", pro);
                        else
                                str += sprintf("%s是你的结义妹子。\n", pro);
                } else
                {
                        if (obj->query("mud_age") > me->query("mud_age"))
                                str += sprintf("%s是你的结义兄长。\n", pro);
                        else
                                str += sprintf("%s是你的义弟。\n", pro);
                }
        } else
        if (obj != me && obj->query("league") &&
            obj->query("league/league_name") == me->query("league/league_name"))
        {
                str += sprintf("%s和你均是%s的同盟义士。\n", pro,
                               obj->query("league/league_name"));
        }

        // If we both has family, check if we have any relations.
        if (obj != me &&
            mapp(fam = obj->query("family")) &&
            mapp(my_fam = me->query("family")) &&
            fam["family_name"] == my_fam["family_name"])
        {

                if (fam["generation"] == my_fam["generation"])
                {

                        if ((string)obj->query("gender") == "男性" ||
                                (string)obj->query("gender") == "无性")
                                str += sprintf( pro + "是你的%s%s。\n",
                                        my_fam["master_id"] == fam["master_id"]? "": "同门",
                                        my_fam["enter_time"] > fam["enter_time"] ? "师兄": "师弟");
                        else
                                str += sprintf( pro + "是你的%s%s。\n",
                                        my_fam["master_id"] == fam["master_id"]? "": "同门",
                                        my_fam["enter_time"] > fam["enter_time"] ? "师姐": "师妹");
                } else
                if (fam["generation"] < my_fam["generation"])
                {
                        if (my_fam["master_id"] == obj->query("id"))
                                str += pro + "是你的师父。\n";
                        else
                        if (my_fam["generation"] - fam["generation"] > 1)
                                str += pro + "是你的同门长辈。\n";
                        else
                        if (fam["enter_time"] < my_fam["enter_time"])
                                str += pro + "是你的师伯。\n";
                        else
                                str += pro + "是你的师叔。\n";
                } else
                {
                        if (fam["generation"] - my_fam["generation"] > 1)
                                str += pro + "是你的同门晚辈。\n";
                        else
                        if (fam["master_id"] == me->query("id"))
                                str += pro + "是你的弟子。\n";
                        else
                                str += pro + "是你的师侄。\n";
                }
        }

        if (obj->is_chatter())
        {
                message("vision", str, me);
                return 1;
        }

        if (stringp(obj->query_temp("eff_status_msg")))
        {
                str += obj->query_temp("eff_status_msg") + "\n";
        } else
        if (obj->query("max_qi"))
                str += pro + COMBAT_D->eff_status_msg((int)obj->query("eff_qi")* 100 / (int)obj->query("max_qi")) + "\n";

        if (obj->query_temp("daub/poison/remain") &&
            (me == obj || random((int)me->query_skill("poison", 1)) > 80))
        {
                str += pro + HIG "身上现在" + (me == obj ? "" : "似乎") +
                       "淬了" + (me == obj ? obj->query_temp("daub/poison/name") : "毒") +
                       NOR "。\n";
        }

        str += look_equiped(me, obj, pro);
        message("vision", str, me);

        if (obj != me
           && living(obj)
           && ! me->is_brother(obj)
           && ! obj->query_condition("die_guard")
           && ! me->query_condition("die_guard")
           && me->query("couple/id") != obj->query("id")
           && (((me_shen < 0) && (obj_shen > 0))
           || ((me_shen > 0) && (obj_shen < 0)))
           && (((me_shen - obj_shen) > ((int)obj->query("max_neili") * 20))
           || ((obj_shen - me_shen) > ((int)obj->query("max_neili") * 20))))
        {
                tell_object(me, obj->name() + "突然转过头来瞪你一眼。\n");
                if (obj->query("age") > 15 && me->query("age") > 15)
                   if (! wizardp(obj) && ! wizardp(me))
                        COMBAT_D->auto_fight(obj, me, "berserk");
        }
        return 1;
}

int look_room_item(object me, string arg)
{
        object env;
        mapping item, exits;

        if (! objectp(env = environment(me)))
                return notify_fail("这里只有灰蒙蒙地一片，什么也没有。\n");
        if (mapp(item = env->query("item_desc")) && !undefinedp(item[arg]))
	{
                if (stringp(item[arg]))
                        tell_object(me, item[arg]);
                else
		if(functionp(item[arg]))
                        tell_object(me, (string)(*item[arg])(me));

                return 1;
        }
        if (mapp(exits = env->query("exits")) && ! undefinedp(exits[arg]))
	{
                if (objectp(env = find_object(exits[arg])))
                        look_room(me, env, 0);
                else
		{
                        call_other(exits[arg], "???");
                        look_room(me, find_object(exits[arg]), 0);
                }
                return 1;
        }
        return notify_fail("你要看什么？\n");
}

int help(object me)
{
        write(@HELP
指令格式: look [<物品>|<生物>|<方向>]

这个指令让你查看你所在的环境、某件物品、生物、或是方向。如果
在look指令后面有参数，将先察看身上是否有该物品，如果没有则察
看你所在的环境中是否有该物品或人物。如果你身上的物品和你所在
的环境有ID相同的物品，你可以指明look ??? of me/here 以指明你
想要察看自己身上的物品还是附近环境中的物品。同时，如果使用命
令 look ??? of <id> 可以看他人的装备或是亮出来的物品。

HELP
);
        return 1;
}