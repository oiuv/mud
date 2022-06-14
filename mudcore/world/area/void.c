/**
 * @brief 区域模式示例，进入区域后可用sa指令建设地区
 *
 */
inherit CORE_STD_AREA;

void create()
{
    set("name", "虚空幻境");
    set("x_axis_size", 100);    // 橫向大小
    set("y_axis_size", 50);     // 縱向大小
    setup();
}
